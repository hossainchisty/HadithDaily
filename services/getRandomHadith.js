const Hadith =  require('../schema/hadithModels');


// Function to generate a random hadith
const generateRandomHadith = async () => {
    try {
      const count = await Hadith.countDocuments(); // Get the total count of hadiths in the database
      const randomIndex = Math.floor(Math.random() * count); // Generate a random index
      const randomHadith = await Hadith.findOne().skip(randomIndex); // Retrieve the random hadith
  
      return randomHadith; // Return the random hadith object
    } catch (error) {
      throw error;
    }
  };
  

module.exports = generateRandomHadith;