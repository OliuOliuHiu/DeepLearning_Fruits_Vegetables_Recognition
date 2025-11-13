// Mapping fruit names to emoji icons
export const fruitIcons: Record<string, string> = {
  'apple': '🍎',
  'banana': '🍌',
  'beetroot': '🫒',       // không có emoji riêng → dùng emoji thực vật
  'bell pepper': '🫑',
  'cabbage': '🥬',
  'capsicum': '🫑',
  'carrot': '🥕',
  'cauliflower': '🥦',
  'chilli pepper': '🌶️',
  'corn': '🌽',
  'cucumber': '🥒',
  'eggplant': '🍆',
  'garlic': '🧄',
  'ginger': '🫚',
  'grapes': '🍇',
  'jalepeno': '🌶️',
  'kiwi': '🥝',
  'lemon': '🍋',
  'lettuce': '🥬',
  'mango': '🥭',
  'onion': '🧅',
  'orange': '🍊',
  'paprika': '🫑',
  'pear': '🍐',
  'peas': '🫛',
  'pineapple': '🍍',
  'pomegranate': '🧿',  
  'potato': '🥔',
  'raddish': '🫒',       
  'soy beans': '🫘',
  'spinach': '🥬',
  'sweetcorn': '🌽',
  'sweetpotato': '🍠',
  'tomato': '🍅',
  'turnip': '🥬',      
  'watermelon': '🍉',
};

export function getFruitIcon(fruitName: string): string {
  const normalized = fruitName.toLowerCase().trim();
  return fruitIcons[normalized] || '🍎'; // Default to apple emoji
}

