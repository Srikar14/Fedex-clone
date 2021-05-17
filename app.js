const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mapBoxToken = 'pk.eyJ1Ijoic3Jpa2FyMTQiLCJhIjoiY2ttYXJkenV2MWI1ajJ1bnVwcGFncDR2ayJ9.aG2LXb6d2UW8Epj5xgNTyQ'
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken })
const userRoutes = require('./routes/users');
const { isLoggedIn } = require('./middleware')
const catchAsync = require('./utils/catchAsync')
const Shipment = require('./models/shipments')
const Package = require('./models/package')
const { shipmentSchema, packageSchema } = require('./schemas')

mongoose.connect('mongodb://localhost:27017/fed', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const validateShipment = (req, res, next) => {
    const { sender, recipient, weight, dimensions } = req.body
    {
        let { error } = shipmentSchema.validate({ sender, recipient })
        if (error) {
            const msg = error.details.map(el => el.message).join(',')
            throw new ExpressError(msg, 400)
        }
    }
    {
        let { error } = packageSchema.validate({ weight, dimensions })
        if (error) {
            const msg = error.details.map(el => el.message).join(',')
            throw new ExpressError(msg, 400)
        } else {
            next()
        }
    }
}

app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);

app.get('/fake', async (req, res) => {
    const user = new User({ email: 'ruthwik2525@gmail.com', username });
    const newUser = await User.register(user, 'password')
    res.send(newUser)
})

app.get('/', async (req, res) => {
    console.log(req.user)
    res.render('home')
});

app.get('/ship', (req, res) => {
    res.render('ship')
});

app.post('/ship', validateShipment, catchAsync(async (req, res) => {
    const user = req.user
    const { sender, recipient, shipmentType, weight, dimensions, purpose } = req.body
    const shipmentId = Math.random().toString(36).substring(7)
    const shipment = new Shipment({
        username: user.username,
        shipmentId,
        shipmentType,
        sender,
        recipient,
    })
    const geoData = await geoCoder.forwardGeocode({
        query: sender.City+", "+sender.Country,
        limit: 1
    }).send()
    const trackingId = Math.random().toString(36).substring(5)
    const package = new Package({ trackingId, weight, dimensions, geometry: geoData.body.features[0].geometry , location: sender.City+", "+sender.Country, purpose})
    console.log(package)
    await shipment.save()
    await package.save()
    user.shipments.push(shipment)
    user.packages.push(package)
    await user.save()
    res.redirect('/shipments')
}));

app.get('/shipments', isLoggedIn, catchAsync(async (req, res) => {
    const shipments = []
    for (let i of req.user.shipments) {
        const shipment = await Shipment.findById(i)
        shipments.push(shipment)
    }
    const packages = []
    for (let i of req.user.packages) {
        const package = await Package.findById(i)
        packages.push(package)
    }
    res.render('shipments', { shipments, packages })
}))

app.get('/track/:id', catchAsync( async (req, res) => {
    const pack = await Package.findById(req.params.id)
    res.render('show', { pack })
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
