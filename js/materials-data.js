// Static catalog data. Prices are in Nigerian Naira (NGN) and are
// illustrative placeholders, update to match current market rates.

export const CEMENT = [
  { id: "cem-dangote", name: "Dangote 3X", unit: "bag", price: 9200 },
  { id: "cem-bua", name: "BUA Cement", unit: "bag", price: 9000 },
  { id: "cem-lafarge", name: "Lafarge (WAPCO)", unit: "bag", price: 9350 },
  { id: "cem-ashaka", name: "Ashaka Gold", unit: "bag", price: 8800 }
];

export const IRON_RODS = [
  { id: "rod-8", name: "8mm Iron Rod", unit: "length (12m)", price: 4800 },
  { id: "rod-10", name: "10mm Iron Rod", unit: "length (12m)", price: 7200 },
  { id: "rod-12", name: "12mm Iron Rod", unit: "length (12m)", price: 10500 },
  { id: "rod-16", name: "16mm Iron Rod", unit: "length (12m)", price: 18500 },
  { id: "rod-20", name: "20mm Iron Rod", unit: "length (12m)", price: 28000 },
  { id: "rod-25", name: "25mm Iron Rod", unit: "length (12m)", price: 42000 }
];

export const SAND_TYPES = [
  { id: "sharp", name: "Sharp Sand", pricePerTon: 9000 },
  { id: "plaster", name: "Plaster Sand", pricePerTon: 8500 },
  { id: "granite", name: "Granite", pricePerTon: 15000 }
];

export const TRIP_SIZES = [
  { id: "5t", name: "5-Ton Mini Tipper", tons: 5 },
  { id: "10t", name: "10-Ton Tipper", tons: 10 },
  { id: "15t", name: "15-Ton Tipper", tons: 15 },
  { id: "20t", name: "20-Ton Tipper", tons: 20 }
];

export const DELIVERY_FEE = 5000;

export function formatNaira(amount) {
  return "\u20A6" + Math.round(amount).toLocaleString("en-NG");
}
