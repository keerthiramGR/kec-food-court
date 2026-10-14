
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('assets/menu');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 66 distinct search targets with exact image queries
const DISH_SPECS = [
  // 1-7: PAROTTA & ROTI
  { id: "f-1", name: "Parotta", query: "File:Parotta 2.jpg" },
  { id: "f-2", name: "Chappathi", query: "File:Chapati-1.jpg" },
  { id: "f-3", name: "Chilly Parotta", query: "File:Chilli chicken with kerala parotta.jpg" },
  { id: "f-4", name: "Egg Parotta", query: "File:Parotta with Egg Kurma and Onion Slices.JPG" },
  { id: "f-5", name: "Veg. Kothu Parotta", query: "File:Veg Kothu Parotta served in Tamil Nadu.JPG" },
  { id: "f-6", name: "Egg. Kothu Parotta", query: "File:Kotthu s piletinom.JPG" },
  { id: "f-7", name: "Chkn. Kothu Parotta", query: "File:Kothu Parotta (Chicken) as served in Tamil Nadu, India.jpg" },

  // 8-17: DOSA & ROAST
  { id: "f-8", name: "Roast", query: "File:Dosa-chutney-sambhar.jpg" },
  { id: "f-9", name: "Ghee Roast", query: "File:Ghee Roast Dosa.jpg" },
  { id: "f-10", name: "Onion Roast", query: "File:Egg onion dosa is ready.jpg" },
  { id: "f-11", name: "Egg Roast", query: "File:Egg Dosa.JPG" },
  { id: "f-12", name: "Podi Roast", query: "File:Picture of Idli milagai podi for idli and dosa.JPG" },
  { id: "f-13", name: "Masala Roast", query: "File:Masala dosa 01.jpg" },
  { id: "f-14", name: "Dosai", query: "File:Plain Dosa & Vada.jpg" },
  { id: "f-15", name: "Egg Dosai", query: "File:Adai Dosai with Chutney 03.jpg" },
  { id: "f-16", name: "Podi Dosai", query: "File:Dosai with dal and idli powder.JPG" },
  { id: "f-17", name: "Poori", query: "File:Puri Bhaji.JPG" },

  // 18-22: EGG SPECIALS
  { id: "f-18", name: "Omlet", query: "File:FoodOmelete.jpg" },
  { id: "f-19", name: "Half Boil", query: "File:Fried egg sunny side up with meal.jpg" },
  { id: "f-20", name: "Full Boil", query: "File:Boiled Egg - Crossection.jpg" },
  { id: "f-21", name: "Kalaki", query: "File:Kalaki (An Omelette half cooked with chicken curry on it) as served in Chennai,Tamil Nadu..jpg" },
  { id: "f-22", name: "Egg Poriyal", query: "File:Spicy egg bhurji @ the eggfactory.jpg" },

  // 23-30: FRIED RICE
  { id: "f-23", name: "Veg. Fried Rice", query: "File:Veg fried rice - 1.jpg" },
  { id: "f-24", name: "Sechzwan Veg Frd Rice", query: "File:Schezwan fried rice" },
  { id: "f-25", name: "Gobi Fried Rice", query: "File:Fried rice vegetables" },
  { id: "f-26", name: "Mushroom Fried Rice", query: "File:Mushroom fried rice, Loving Hut, Yogyakarta.jpg" },
  { id: "f-27", name: "Egg. Fried Rice", query: "File:Fried Rice with Egg and Dalmote.jpg" },
  { id: "f-28", name: "Sechzwan Egg Rice", query: "File:Schezwan Egg Fried Rice with raitha 01.jpg" },
  { id: "f-29", name: "Chicken Fried Rice", query: "File:Fried rice with chicken (17234644521).jpg" },
  { id: "f-30", name: "Sechzwan Chkn. Frd Rice", query: "File:Schezwan chicken fried rice" },

  // 31-38: NOODLES
  { id: "f-31", name: "Veg Noodles", query: "File:Veg Chowmein Indian Style!.jpg" },
  { id: "f-32", name: "Sechzwan Veg. Noodles", query: "File:Mixed Schezwan Fried Rice - Noodles & Live Pasta - Avani Riverside Mall - Howrah 2016-10-10 0153.JPG" },
  { id: "f-33", name: "Gobi Noodles", query: "File:Char Kway Teow in Hong Kong.jpg" },
  { id: "f-34", name: "Mushroom Noodles", query: "File:Spring garlic and mushroom miso organic wholemeal noodles, vegan (7866805576).jpg" },
  { id: "f-35", name: "Egg Noodles", query: "File:Noodles and fried egg 2.jpg" },
  { id: "f-36", name: "Sechzwan Egg Noodles", query: "File:Spicy noodles egg" },
  { id: "f-37", name: "Chicken Noodles", query: "File:Chicken Noodle Soup.jpg" },
  { id: "f-38", name: "Sechzwan Chkn. Noodles", query: "File:Schezwan noodles.jpg" },

  // 39-42: CHICKEN BONELESS GRAVY
  { id: "f-39", name: "Chicken Butter Masala", query: "File:Jeera rice with butter chicken and chicken tiika.jpg" },
  { id: "f-40", name: "Chicken Chettinad", query: "File:ChickenChettinad.JPG" },
  { id: "f-41", name: "Chicken Pallipalayam", query: "File:Pallipalayam chicken.jpg" },
  { id: "f-42", name: "Chicken Pepper", query: "File:Pepper Chicken (869566714).jpg" },

  // 43-50: CHICKEN BONELESS DRY
  { id: "f-43", name: "Chicken 65", query: "File:Chicken 65 (Dish).jpg" },
  { id: "f-44", name: "Chicken Pallipalayam", query: "File:Pallipalayam chicken fry" },
  { id: "f-45", name: "Chicken Maharani", query: "File:Chicken Maharani masala" },
  { id: "f-46", name: "Chicken Pepper", query: "File:Princes hot chicken.jpg" },
  { id: "f-47", name: "Chicken Hyderabad", query: "File:Hyderabadi Chicken Biryani.jpg" },
  { id: "f-48", name: "Chicken Garlic", query: "File:Pollo al ajillo (Panaderas).jpg" },
  { id: "f-49", name: "Chicken Manjurian", query: "File:Chicken Manchurian dry" },
  { id: "f-50", name: "Chicken Sechzwan", query: "File:Szechuan chicken dry" },

  // 51-60: VEG SPECIALS
  { id: "f-51", name: "Gobi Chilly", query: "File:Chilli Gobi Kumaran Tiffin center.jpg" },
  { id: "f-52", name: "Gobi Masala", query: "File:Aloo Gobi Masala - Mohali 2016-08-07 8551.JPG" },
  { id: "f-53", name: "Gobi Manjurian", query: "File:Gobi manchurian.jpg" },
  { id: "f-54", name: "Gobi Pallipalayam Dry", query: "File:Spicy and crispy cauliflowers and eggplants.jpg" },
  { id: "f-55", name: "Mushroom Chilly", query: "File:Chilli Mushroom" },
  { id: "f-56", name: "Mushroom Masala", query: "File:Mushroom Tikka Masala by Preeti Tamilarasan.jpg" },
  { id: "f-57", name: "Mushroom Manjurian", query: "File:Mushroom Manchurian dry.jpg" },
  { id: "f-58", name: "Mushroom Pepper Dry", query: "File:Mushroom pepper fry" },
  { id: "f-59", name: "Panner Butter Masala", query: "File:Paneer butter masala 2.jpg" },
  { id: "f-60", name: "Babycorn Manjurian", query: "File:Babycorn Manchurian Gravy 01.jpg" },

  // 61-64: ROTI / NAAN
  { id: "f-61", name: "Naan", query: "File:Naan Bread.JPG" },
  { id: "f-62", name: "Butter Naan", query: "File:New Punjab Club food spread.jpg" },
  { id: "f-63", name: "Romali Rotti", query: "File:Rumali roti.jpg" },
  { id: "f-64", name: "Romali Butter Rotti", query: "File:Tandoori Roti in clay oven.JPG" },

  // 65-66: BIRYANI & EGG MASALA
  { id: "f-65", name: "Chicken Briyani", query: "File:Dum Biryani Plate.jpg" },
  { id: "f-66", name: "Egg Masala", query: "File:Anda curry( egg curry).JPG" }
];

async function getImageUrl(query) {
  // If it's a specific File title
  let apiUrl = '';
  if (query.startsWith('File:')) {
    apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=imageinfo&iiprop=url&format=json`;
  } else {
    apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json`;
  }

  const res = await fetch(apiUrl, {
    headers: { 'User-Agent': 'KECFoodCourtPlatform/1.0 (dining@kec.ac.in)' }
  });
  const data = await res.json();
  const pages = data.query?.pages || {};
  for (const k in pages) {
    const url = pages[k].imageinfo?.[0]?.url;
    if (url) return url;
  }
  return null;
}

async function run() {
  console.log(`Starting image acquisition for 66 distinct dishes...`);

  for (let i = 0; i < DISH_SPECS.length; i++) {
    const dish = DISH_SPECS[i];
    const targetFile = path.join(outDir, `${dish.id}.jpg`);

    // Check if already downloaded with size > 10KB
    if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 10000) {
      console.log(`[${i+1}/66] ${dish.name} already exists locally (${(fs.statSync(targetFile).size/1024).toFixed(1)} KB)`);
      continue;
    }

    try {
      let imgUrl = await getImageUrl(dish.query);
      if (!imgUrl) {
        // Fallback search with dish name
        imgUrl = await getImageUrl(dish.name);
      }

      if (imgUrl) {
        const imgRes = await fetch(imgUrl, {
          headers: { 'User-Agent': 'KECFoodCourtPlatform/1.0 (dining@kec.ac.in)' }
        });
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          fs.writeFileSync(targetFile, buffer);
          console.log(`[${i+1}/66] SUCCESS: Downloaded ${dish.name} -> ${dish.id}.jpg (${(buffer.length/1024).toFixed(1)} KB)`);
        } else {
          console.warn(`[${i+1}/66] FAILED download for ${dish.name} from ${imgUrl}`);
        }
      } else {
        console.warn(`[${i+1}/66] NO URL FOUND for ${dish.name}`);
      }
    } catch (e) {
      console.error(`[${i+1}/66] ERROR on ${dish.name}:`, e.message);
    }

    // Friendly 650ms delay to respect Wikimedia API guidelines
    await new Promise(r => setTimeout(r, 650));
  }

  console.log(`\nFinished checking all 66 items!`);
  const downloaded = fs.readdirSync(outDir).filter(f => f.endsWith('.jpg'));
  console.log(`Total local images in assets/menu: ${downloaded.length}`);
}

run();
