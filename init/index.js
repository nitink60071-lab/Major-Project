const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/Listing.js");
const axios = require("axios");
const MAP_TOKEN = process.env.MAP_TOKEN;


const MONGO_URL = process.env.ATLASDB_URL;

main()
.then(async () => {
    //console.log(data);
    console.log("connected to DB");
    await initDB();
    process.exit();
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const getCoordinates = async (location, country) => {
    try {
        let query = `${location}, ${country}`;
        let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAP_TOKEN}&limit=1`;
        let response = await axios.get(url);
        if(response.data.features.length > 0) {
            return response.data.features[0].geometry.coordinates;
        }
        return [78.9629, 20.5937];
    } catch(e) {
        return [78.9629, 20.5937];
    }
};

const initDB = async () => {
    await Listing.deleteMany({});
    
    let updatedData = [];
    for(let obj of initData.data) {
        let coordinates = await getCoordinates(obj.location, obj.country);
        updatedData.push({
            ...obj,
            owner: '6a2f91b62e28f39703943a89',
            geometry: {
                type: "Point",
                coordinates: coordinates
            }
        });
    }
    
    await Listing.insertMany(updatedData);
    console.log("data was initialized");
};

//const data = await Listing.find();
//console.log(data);
