const mongoose = require('mongoose');

const { faker } = require('@faker-js/faker');
// const connectDB = require('./Config/db');
require('./Config/db');
const Product = require('./Models/Data');

const categories = ['mobiles & tablets', 'tvs', 'fashion','beauty','furniture','grocery','home & kitchen'];

const seedProducts = async () => {
  try {
    // await connectDB(); 

   
    await Product.deleteMany({});

 
    for (const category of categories) {
      for (let i = 0; i < 10; i++) {
        const product = new Product({
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: parseFloat(faker.commerce.price()),
          category: category,
          imageUrl: faker.image.imageUrl(400, 300, 'tech', true),
        });
        await product.save();
      }
    }

    console.log('Products seeded successfully');
    mongoose.connection.close(); 
  } catch (err) {
    console.error('Error seeding products:', err);
    mongoose.connection.close(); 
  }
};

seedProducts();
