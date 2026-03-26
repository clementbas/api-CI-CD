import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import Fruit from '../src/models/Fruit.js';

dotenv.config();

const fruits = [
  { name: 'Pomme', description: 'Pomme rouge croquante', price: 2.2, stock: 150, category: 'fresh' },
  { name: 'Banane', description: 'Banane bien mure', price: 2.5, stock: 180, category: 'fresh' },
  { name: 'Orange', description: 'Orange juteuse', price: 2.8, stock: 120, category: 'citrus' },
  { name: 'Mandarine', description: 'Mandarine sucree', price: 3.1, stock: 110, category: 'citrus' },
  { name: 'Clementine', description: 'Clementine facile a eplucher', price: 3.3, stock: 130, category: 'citrus' },
  { name: 'Citron', description: 'Citron jaune acidule', price: 2.0, stock: 100, category: 'citrus' },
  { name: 'Citron Vert', description: 'Lime parfumee', price: 2.4, stock: 95, category: 'citrus' },
  { name: 'Poire', description: 'Poire fondante', price: 2.9, stock: 90, category: 'fresh' },
  { name: 'Peche', description: 'Peche jaune sucree', price: 3.4, stock: 80, category: 'summer' },
  { name: 'Nectarine', description: 'Nectarine lisse et juteuse', price: 3.6, stock: 85, category: 'summer' },
  { name: 'Abricot', description: 'Abricot bien sucre', price: 4.2, stock: 70, category: 'summer' },
  { name: 'Prune', description: 'Prune violette', price: 3.8, stock: 75, category: 'summer' },
  { name: 'Fraise', description: 'Fraise parfumee', price: 5.9, stock: 60, category: 'berries' },
  { name: 'Framboise', description: 'Framboise delicate', price: 7.2, stock: 45, category: 'berries' },
  { name: 'Myrtille', description: 'Myrtille riche en antioxydants', price: 7.8, stock: 40, category: 'berries' },
  { name: 'Mure', description: 'Mure noire et sucree', price: 7.5, stock: 35, category: 'berries' },
  { name: 'Raisin Blanc', description: 'Raisin blanc sans pepins', price: 4.6, stock: 85, category: 'fresh' },
  { name: 'Raisin Noir', description: 'Raisin noir sucre', price: 4.9, stock: 80, category: 'fresh' },
  { name: 'Ananas', description: 'Ananas tropical', price: 5.4, stock: 50, category: 'tropical' },
  { name: 'Mangue', description: 'Mangue fondante', price: 4.8, stock: 65, category: 'tropical' },
  { name: 'Papaye', description: 'Papaye exotique', price: 6.2, stock: 40, category: 'tropical' },
  { name: 'Kiwi', description: 'Kiwi vert vitamine', price: 3.0, stock: 90, category: 'fresh' },
  { name: 'Grenade', description: 'Grenade riche en graines', price: 4.4, stock: 55, category: 'fresh' },
  { name: 'Pasteque', description: 'Pasteque rafraichissante', price: 8.5, stock: 30, category: 'summer' },
  { name: 'Melon', description: 'Melon charentais', price: 6.8, stock: 38, category: 'summer' },
  { name: 'Litchi', description: 'Litchi parfumee', price: 9.5, stock: 25, category: 'tropical' },
  { name: 'Fruit de la Passion', description: 'Acidule et tropical', price: 10.2, stock: 22, category: 'tropical' },
  { name: 'Noix de Coco', description: 'Noix de coco complete', price: 4.1, stock: 45, category: 'tropical' },
  { name: 'Figue', description: 'Figue violette', price: 5.3, stock: 35, category: 'summer' },
  { name: 'Pamplemousse', description: 'Pamplemousse rose', price: 3.7, stock: 50, category: 'citrus' }
];

const seedFruits = async () => {
  await connectDB();

  const operations = fruits.map((fruit) => ({
    updateOne: {
      filter: { name: fruit.name },
      update: {
        $set: {
          ...fruit,
          isActive: true
        }
      },
      upsert: true
    }
  }));

  const result = await Fruit.bulkWrite(operations, { ordered: false });

  console.log('Fruits seed completed');
  console.log(`Matched: ${result.matchedCount}`);
  console.log(`Modified: ${result.modifiedCount}`);
  console.log(`Upserted: ${result.upsertedCount}`);

  await mongoose.disconnect();
};

seedFruits().catch(async (error) => {
  console.error('Failed to seed fruits:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
