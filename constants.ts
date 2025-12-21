import { AppData } from './types';

export const INITIAL_DATA: AppData = {
  settings: {
    expenses: [
      { id: 1, category: "Rent", amount: 8000 },
      { id: 2, category: "Utilities", amount: 4000 },
      { id: 3, category: "Staff", amount: 3000 },
    ],
    isVatRegistered: true,
    isPwdSeniorActive: false,
    otherDiscountRate: 0
  },
  ingredients: [
    {
      id: 1, name: "Rice", unit: "g", cost: 0.08, stockQty: 5000, minStock: 1000, supplier: "Supplier A",
      packageCost: 55, packageQty: 1000, shippingFee: 25, type: 'ingredient'
    },
    {
      id: 2, name: "Cooking Oil", unit: "mL", cost: 0.075, stockQty: 4000, minStock: 2000, supplier: "Supplier B",
      packageCost: 150, packageQty: 2000, shippingFee: 0, type: 'ingredient'
    },
    {
      id: 3, name: "Garlic", unit: "g", cost: 0.16, stockQty: 1000, minStock: 500, supplier: "Supplier C",
      packageCost: 80, packageQty: 500, shippingFee: 0, type: 'ingredient'
    },
    {
      id: 4, name: "Onion", unit: "g", cost: 0.09, stockQty: 2000, minStock: 1000, supplier: "Supplier A",
      packageCost: 90, packageQty: 1000, shippingFee: 0, type: 'ingredient'
    },
    {
      id: 5, name: "Chicken Breast", unit: "g", cost: 0.18, stockQty: 3000, minStock: 1000, supplier: "Supplier A",
      packageCost: 180, packageQty: 1000, shippingFee: 0, type: 'ingredient'
    },
    {
      id: 6, name: "Soy Sauce", unit: "mL", cost: 0.06, stockQty: 2000, minStock: 1000, supplier: "Supplier B",
      packageCost: 60, packageQty: 1000, shippingFee: 0, type: 'ingredient'
    },
    {
      id: 7, name: "Vinegar", unit: "mL", cost: 0.05, stockQty: 2000, minStock: 1000, supplier: "Supplier B",
      packageCost: 50, packageQty: 1000, shippingFee: 0, type: 'ingredient'
    },
    {
      id: 8, name: "Salt", unit: "g", cost: 0.05, stockQty: 1000, minStock: 500, supplier: "Supplier A",
      packageCost: 25, packageQty: 500, shippingFee: 0, type: 'ingredient'
    },
    {
      id: 9, name: "Sugar", unit: "g", cost: 0.045, stockQty: 2000, minStock: 1000, supplier: "Supplier C",
      packageCost: 45, packageQty: 1000, shippingFee: 0, type: 'ingredient'
    },
    // Other / Packaging Items
    {
      id: 20, name: "Styro Small", unit: "pc", cost: 12.00, stockQty: 500, minStock: 100, supplier: "Local Market",
      packageCost: 100, packageQty: 10, shippingFee: 20, type: 'other'
    },
    {
      id: 21, name: "Spoon & Fork Set", unit: "set", cost: 2.00, stockQty: 1000, minStock: 200, supplier: "Local Market",
      packageCost: 50, packageQty: 25, shippingFee: 0, type: 'other'
    },
    {
      id: 22, name: "Napkin (single)", unit: "pc", cost: 0.40, stockQty: 2000, minStock: 500, supplier: "Local Market",
      packageCost: 40, packageQty: 100, shippingFee: 0, type: 'other'
    },
    {
      id: 23, name: "Small Plastic Bag", unit: "pc", cost: 0.90, stockQty: 1000, minStock: 200, supplier: "Local Market",
      packageCost: 30, packageQty: 50, shippingFee: 15, type: 'other'
    }
  ],
  recipes: [
    {
      id: 101,
      name: "Chicken Adobo",
      category: "Main Course",
      ingredients: [
        { id: 5, qty: 200 }, // 200g Chicken
        { id: 6, qty: 45 },  // 45ml Soy Sauce
        { id: 7, qty: 30 },  // 30ml Vinegar
        { id: 3, qty: 10 },  // 10g Garlic
        { id: 2, qty: 15 },  // 15ml Oil
        { id: 9, qty: 10 }   // 10g Sugar
      ],
      margin: 50,
      price: 180,
      dailyVolume: 25,
      image: null,
      batchSize: 1
    },
    {
      id: 102,
      name: "Garlic Fried Rice",
      category: "Main Course",
      ingredients: [
        { id: 1, qty: 250 }, // 250g Rice
        { id: 3, qty: 15 },  // 15g Garlic
        { id: 2, qty: 20 },  // 20ml Oil
        { id: 8, qty: 5 }    // 5g Salt
      ],
      margin: 45,
      price: 60,
      dailyVolume: 40,
      image: null,
      batchSize: 1,
      instructions: [
        "Sauté garlic in oil until golden brown. Set aside half for toppings.",
        "Add day-old rice to the pan and stir-fry for 5 minutes.",
        "Season with salt and pepper.",
        "Top with reserved fried garlic before serving."
      ]
    },
    {
      id: 103,
      name: "Garlic Chicken Rice Meal",
      category: "Main Course",
      ingredients: [
        { id: 1, qty: 120 },  // Rice
        { id: 5, qty: 150 },  // Chicken Breast
        { id: 3, qty: 10 },   // Garlic
        { id: 4, qty: 20 },   // Onion
        { id: 6, qty: 15 },   // Soy Sauce
        { id: 7, qty: 10 },   // Vinegar
        { id: 8, qty: 2 },    // Salt
        { id: 9, qty: 2 },    // Sugar
        { id: 2, qty: 30 },   // Cooking Oil
        { id: 20, qty: 1 },   // Styro Small
        { id: 21, qty: 1 },   // Spoon & Fork Set
        { id: 22, qty: 1 },   // Napkin
        { id: 23, qty: 1 }    // Small Plastic Bag
      ],
      margin: 70,
      price: 221,
      dailyVolume: 15,
      image: '/garlic_chicken_rice.jpg',
      batchSize: 1
    }
  ],
  dailySnapshots: []
};

export const INITIAL_BUILDER = {
  id: null,
  name: "",
  category: "Main Course",
  ingredients: [],
  batchSize: 1,
  margin: 40,
  image: null,
  dailyVolume: 10,
  showBuilder: false
};