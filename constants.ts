import { AppData } from './types';

export const INITIAL_DATA: AppData = {
  settings: {
    expenses: [
      // Default placeholder expenses
      { id: 1, category: "Rent", amount: 0 },
      { id: 2, category: "Utilities", amount: 0 },
      { id: 3, category: "Staff", amount: 0 },
    ],
    isVatRegistered: true,
    isPwdSeniorActive: false,
    otherDiscountRate: 0
  },
  ingredients: [],
  recipes: [],
  dailySnapshots: []
};

export const INITIAL_BUILDER = {
  id: undefined,
  name: '',
  category: '',
  ingredients: [],
  margin: 70, // Default margin
  price: 0,
  dailyVolume: 10,
  image: null,
  batchSize: 1,
  showBuilder: false
};
