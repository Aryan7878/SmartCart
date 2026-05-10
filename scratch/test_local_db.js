import mongoose from 'mongoose';
async function testLocal() {
    try {
        await mongoose.connect('mongodb://localhost:27017/test_local_smartcart', { serverSelectionTimeoutMS: 2000 });
        console.log('Local MongoDB is available!');
        process.exit(0);
    } catch (err) {
        console.log('Local MongoDB is NOT available.');
        process.exit(1);
    }
}
testLocal();
