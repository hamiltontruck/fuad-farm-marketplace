"use client";

import { useEffect, useMemo, useState } from "react";
import LocalLogin from "../components/auth/LocalLogin";
import MultiRoleRegister, { type RegistrationPayload } from "../components/registration/MultiRoleRegister";
import { getRoleName, roleOptions, type RoleId } from "../components/registration/RoleSelector";
import PostAdFlow, { getCategoryName, listingCategories, type Listing, type TransactionType } from "../components/marketplace/PostAdFlow";
import RoleDashboard from "../components/dashboard/RoleDashboard";
import { languageOptions, type Language } from "../lib/i18n";

const LOCAL_PROFILE_KEY = "fuad-marketplace-profile-v1";
const LOCAL_LISTINGS_KEY = "fuad-marketplace-listings-v1";
const LOCAL_SAVED_KEY = "fuad-marketplace-saved-v1";
const LOCAL_LANGUAGE_KEY = "fuad-marketplace-language-v1";
const SESSION_KEY = "fuad-marketplace-session-v1";

const demoListings: Listing[] = [
  { id: "demo-1", title: "High-grade gold ore supply", category: "mineral", categoryLabel: "Mineral", transaction: "broker", price: 1850, priceSuffix: "gram", location: "Adola", seller: "Dawa Mineral Link", role: "Mineral Broker", condition: "Available", description: "Verified small-scale mining supply. Assay and quantity documents available for serious buyers.", icon: "🪨", accent: "violet", time: "18 min ago", verified: true, sample: true },
  { id: "demo-2", title: "Dell Latitude Core i7 laptop", category: "electronics", categoryLabel: "Electronics", transaction: "sell", price: 48000, priceSuffix: "total", location: "Addis Ababa", seller: "Nile Tech Store", role: "Electronics Seller", condition: "Used", description: "16GB RAM, 512GB SSD, clean condition with original charger and 30-day shop warranty.", icon: "💻", accent: "blue", time: "32 min ago", verified: true, sample: true },
  { id: "demo-3", title: "Premium white teff — 8 tons", category: "farm", categoryLabel: "Farm Products", transaction: "sell", price: 118, priceSuffix: "kg", location: "Bishoftu", seller: "Biftu Farmers Union", role: "Farmer Cooperative", condition: "Fresh", description: "New season white teff, cleaned and bagged. Transport can be arranged for bulk buyers.", icon: "🌾", accent: "green", time: "1 hr ago", verified: true, sample: true },
  { id: "demo-4", title: "12mm reinforcement steel bars", category: "construction", categoryLabel: "Construction", transaction: "sell", price: 132000, priceSuffix: "ton", location: "Adama", seller: "Rift Construction Supply", role: "Material Seller", condition: "New", description: "Grade 60 steel reinforcement bars. Full mill certificate and delivery service available.", icon: "🏗️", accent: "orange", time: "2 hrs ago", verified: true, sample: true },
  { id: "demo-5", title: "3-bedroom family house for sale", category: "property", categoryLabel: "Property & Houses", transaction: "broker", price: 12800000, priceSuffix: "total", location: "Addis Ababa", seller: "Liya Property Broker", role: "House Broker", condition: "Available", description: "Finished family home with title deed, parking and water tank. Viewing by appointment.", icon: "🏠", accent: "rose", time: "3 hrs ago", verified: true, sample: true },
  { id: "demo-6", title: "Locally manufactured PVC pipes", category: "manufactured", categoryLabel: "Manufactured", transaction: "sell", price: 640, priceSuffix: "piece", location: "Hawassa", seller: "Abyssinia Plastics", role: "Manufacturer", condition: "New", description: "Multiple diameters available for construction and irrigation. Factory-direct volume prices.", icon: "🏭", accent: "slate", time: "Today", verified: true, sample: true },
  { id: "demo-7", title: "Looking to buy washed coffee", category: "buyer", categoryLabel: "Buy Requests", transaction: "buy", price: 310, priceSuffix: "kg", location: "Dire Dawa", seller: "East Coffee Export", role: "Bulk Buyer", condition: "Wanted", description: "Seeking 20 tons of traceable washed Arabica. Cooperative and producer offers welcome.", icon: "🛒", accent: "gold", time: "Today", verified: true, sample: true },
  { id: "demo-8", title: "Farm-to-market broker service", category: "broker", categoryLabel: "Broker Services", transaction: "broker", price: 2, priceSuffix: "percent", location: "Jimma", seller: "Hassan Trade Link", role: "Agricultural Broker", condition: "Service", description: "Connecting coffee, spice and grain producers with verified wholesale buyers across Ethiopia.", icon: "🤝", accent: "teal", time: "Yesterday", verified: true, sample: true },
  { id: "demo-9", title: "Healthy goats and chickens for sale", category: "livestock", categoryLabel: "Livestock & Animal Products", transaction: "sell", price: 12500, priceSuffix: "piece", location: "Shashemene", seller: "Wabe Livestock Farm", role: "Livestock Farmer", condition: "Available", description: "Healthy goats and chickens raised with proper care. Buyers can inspect animals before purchase.", icon: "🐄", accent: "brown", time: "Today", verified: true, sample: true },
];

const locations = ["All Ethiopia", "Addis Ababa", "Adama", "Adola", "Dire Dawa", "Hawassa", "Bahir Dar", "Jigjiga", "Mekelle", "Jimma", "Shashemene", "Bishoftu"];

const demoListingTranslations: Record<"om" | "am", Record<string, Partial<Listing>>> = {
  om: {
    "demo-1": { title: "Albuuda warqee qulqullina olaanaa", categoryLabel: "Albuuda", role: "Broker albuudaa", condition: "Jira", description: "Albuuda warqee hojii albuudaa xixiqqaa mirkanaa’e irraa. Ragaan assay fi baay’inaa bitattoota dhugaatiif jira.", time: "Daqiiqaa 18 dura" },
    "demo-2": { title: "Laptop Dell Latitude Core i7", categoryLabel: "Elektirooniksii", role: "Gurguraa elektirooniksii", condition: "Kan fayyadame", description: "RAM 16GB, SSD 512GB, haala gaarii, charger original fi warranty suuqii guyyaa 30 waliin.", time: "Daqiiqaa 32 dura" },
    "demo-3": { title: "Xaafii adii qulqullina olaanaa — toonii 8", categoryLabel: "Oomisha qonnaa", role: "Waldaa qonnaan bultootaa", condition: "Haaraa", description: "Xaafii adii bara haaraa, qulqullaa’ee korojoo keessatti qophaa’e. Bitattoota baay’inaaf geejjibni ni qindaa’a.", time: "Sa’aatii 1 dura" },
    "demo-4": { title: "Sibiila armature 12mm", categoryLabel: "Meeshaa ijaarsaa", role: "Gurguraa meeshaa ijaarsaa", condition: "Haaraa", description: "Sibiila Grade 60. Ragaa warshaa guutuu fi tajaajila geejjibaa waliin argama.", time: "Sa’aatii 2 dura" },
    "demo-5": { title: "Mana maatii kutaa ciisichaa 3 gurgurtaaf", categoryLabel: "Mana fi lafa", role: "Broker mana keessaa", condition: "Jira", description: "Mana maatii xumurame, kaartaa, parking fi taankii bishaanii qaba. Daawwannaan beellamaan.", time: "Sa’aatii 3 dura" },
    "demo-6": { title: "PVC pipe biyya keessatti oomishame", categoryLabel: "Oomisha warshaa", role: "Oomishtaa", condition: "Haaraa", description: "Hamma adda addaa ijaarsaa fi jallisii keessatti fayyadu. Gatiin warshaa irraa baay’inaaf ni jira.", time: "Har’a" },
    "demo-7": { title: "Buna washed bitachuu barbaanna", categoryLabel: "Barbaacha bitataa", role: "Bitataa baay’inaa", condition: "Barbaadama", description: "Buna Arabica washed toonii 20, maddi isaa beekamu barbaanna. Dhiyeessiin cooperative fi oomishtootaa ni simatama.", time: "Har’a" },
    "demo-8": { title: "Tajaajila broker qonnaa gara gabaatti", categoryLabel: "Tajaajila broker", role: "Broker qonnaa", condition: "Tajaajila", description: "Oomishtoota buna, mi’eessituu fi midhaanii bitattoota jumlaa mirkanaa’an waliin Itoophiyaa keessatti wal qunnamsiisna.", time: "Kaleessa" },
    "demo-9": { title: "Re’ee fi lukkuu fayyaa qaban gurgurtaaf", categoryLabel: "Bu’aa horsiisa horii", role: "Horsiisaa horii", condition: "Jira", description: "Re’ee fi lukkuu kunuunsa gaariin guddatanii fayyaa qabu. Bitattoonni osoo hin bitin daawwachuu danda’u.", time: "Har’a" },
  },
  am: {
    "demo-1": { title: "ከፍተኛ ጥራት ያለው የወርቅ ማዕድን አቅርቦት", categoryLabel: "ማዕድን", role: "የማዕድን ደላላ", condition: "ይገኛል", description: "ከተረጋገጠ አነስተኛ የማዕድን ስራ የቀረበ። የላብራቶሪና የብዛት ሰነዶች ለእውነተኛ ገዢዎች ይገኛሉ።", time: "ከ18 ደቂቃ በፊት" },
    "demo-2": { title: "Dell Latitude Core i7 laptop", categoryLabel: "ኤሌክትሮኒክስ", role: "የኤሌክትሮኒክስ ሻጭ", condition: "ያገለገለ", description: "16GB RAM፣ 512GB SSD፣ በጥሩ ሁኔታ፣ ኦርጅናል charger እና የ30 ቀን ዋስትና አለው።", time: "ከ32 ደቂቃ በፊት" },
    "demo-3": { title: "ከፍተኛ ጥራት ያለው ነጭ ጤፍ — 8 ቶን", categoryLabel: "የእርሻ ምርቶች", role: "የገበሬዎች ማህበር", condition: "ትኩስ", description: "የአዲስ ወቅት ነጭ ጤፍ፣ ተጣርቶ በከረጢት ተዘጋጅቷል። ለጅምላ ገዢዎች ትራንስፖርት ማመቻቸት ይቻላል።", time: "ከ1 ሰዓት በፊት" },
    "demo-4": { title: "12 ሚሜ የአርማታ ብረት", categoryLabel: "የግንባታ ዕቃዎች", role: "የግንባታ ዕቃ ሻጭ", condition: "አዲስ", description: "Grade 60 የአርማታ ብረት። ሙሉ የፋብሪካ ሰርተፍኬትና የማድረስ አገልግሎት አለው።", time: "ከ2 ሰዓት በፊት" },
    "demo-5": { title: "ባለ 3 መኝታ የቤተሰብ ቤት ለሽያጭ", categoryLabel: "ቤትና መሬት", role: "የቤት ደላላ", condition: "ይገኛል", description: "የተጠናቀቀ የቤተሰብ ቤት፣ ካርታ፣ መኪና ማቆሚያና የውሃ ታንክ አለው። በቀጠሮ ማየት ይቻላል።", time: "ከ3 ሰዓት በፊት" },
    "demo-6": { title: "በሀገር ውስጥ የተመረቱ PVC ቱቦዎች", categoryLabel: "የፋብሪካ ምርቶች", role: "አምራች", condition: "አዲስ", description: "ለግንባታና ለመስኖ የሚሆኑ የተለያዩ መጠኖች አሉ። ለጅምላ ትዕዛዝ የፋብሪካ ዋጋ ይቀርባል።", time: "ዛሬ" },
    "demo-7": { title: "የታጠበ ቡና ለመግዛት እንፈልጋለን", categoryLabel: "የግዢ ጥያቄዎች", role: "የጅምላ ገዢ", condition: "ይፈለጋል", description: "ምንጩ የሚታወቅ 20 ቶን የታጠበ Arabica ቡና እንፈልጋለን። የማህበራትና የአምራቾች አቅርቦት እንቀበላለን።", time: "ዛሬ" },
    "demo-8": { title: "ከእርሻ ወደ ገበያ የደላላ አገልግሎት", categoryLabel: "የደላላ አገልግሎት", role: "የእርሻ ደላላ", condition: "አገልግሎት", description: "የቡና፣ የቅመማ ቅመምና የእህል አምራቾችን ከተረጋገጡ የጅምላ ገዢዎች ጋር እናገናኛለን።", time: "ትናንት" },
    "demo-9": { title: "ጤናማ ፍየሎችና ዶሮዎች ለሽያጭ", categoryLabel: "እንስሳትና ውጤቶቻቸው", role: "እንስሳት አርቢ", condition: "ይገኛል", description: "በጥሩ እንክብካቤ ያደጉ ጤናማ ፍየሎችና ዶሮዎች። ገዢዎች ከመግዛታቸው በፊት ማየት ይችላሉ።", time: "ዛሬ" },
  },
};

const pageCopy: Record<Language, Record<string, string>> = {
  om: {
    categories: "Category", marketplace: "Marketplace", dashboard: "Dashboard", how: "Akkaataa hojii", notifications: "Beeksisa", noNotifications: "Beeksisni haaraan hin jiru.", logout: "Ba’i", login: "Seeni", register: "Galmaa’i", postAd: "Maxxansa baasi", openMenu: "Menu bani", mobileNav: "Menu mobile", language: "Afaan fili", live: "Gabaa damee hedduu Itoophiyaa", heroOne: "Biti. Gurguri.", heroTwo: "Broker ta’i.", heroBody: "Oomisha qonnaa, albuuda, elektirooniksii, mana, meeshaa ijaarsaa fi oomisha warshaa—gabaa Itoophiyaa amanamaa tokko keessatti.", searchAria: "Marketplace keessa barbaadi", searchPlaceholder: "Maal barbaadda?", locationAria: "Bakka fili", search: "Barbaadi", popular: "Beekamoo:", activeListings: "Maxxansa jiran", businessRoles: "Gahee daldalaa", regionsCovered: "Naannoo hammate", access: "Gabaa banaa", oneMarket: "GABAA TOKKO", buySellBroker: "Biti · Gurguri · Broker", verifiedSeller: "Gurguraa mirkanaa’e", justNow: "amma", newBuyer: "Barbaacha bitataa haaraa", tonsCoffee: "Buna toonii 20", explore: "CATEGORY SAKATTA’I", categoryTitle: "Wanta daldalli kee barbaadu hunda.", categoryIntro: "Gosa tokko fili; maxxansa gurgurtaa, barbaacha bitataa fi broker waliin argi.", ads: "maxxansa", latest: "MAXXANSA HAARAA", opportunities: "Carraa haaraa siif", results: "bu’aa argame", tradeFilter: "Gosa daldalaatiin maxxansa calali", allAds: "Hunda", forSale: "Gurgurtaaf", wanted: "Barbaadama", broker: "Broker", activeFilters: "Filter hojii irra jiru", clearAll: "Hunda haqi", sample: "FAKKEENYA", viewAria: "Ilaali", viewAd: "Maxxansa ilaali", noListings: "Maxxansi hin argamne", noListingsBody: "Barbaacha, bakka ykn filter jijjiiri.", clearFilters: "Filter hunda haqi", rolesKicker: "SIRNA GAHEE HEDDUU", rolesTitleOne: "Gahee kee filadhu.", rolesTitleTwo: "Gabaa kee jalqabi.", rolesBody: "FUAD ESMART keessatti namni hundi karaa isaaf ta’een galmaa’a; form fi marketplace isa barbaachisu qofa argata.", freeRegister: "Bilisa galmaa’i", howKicker: "AKKAATAA HOJII", howTitle: "Tarkaanfii salphaa afuriin daldala jalqabi.", step1: "Galmaa’i", step1Body: "Gahee kee fili; profile hojii kee guuti.", step2: "Maxxansa baasi", step2Body: "Gurgurtaa, bitannaa ykn broker ta’uun maxxansa baasi.", step3: "Wal barbaadi", step3Body: "Search fi filter fayyadamuun partner sirrii argadhu.", step4: "Daldala xumuri", step4Body: "Odeeffannoo mirkaneeffadhu; karaa nagaatiin walii gali.", ctaTitle: "Gabaa kee har’a jalqabi.", ctaBody: "Maxxansi jalqabaa bilisa. Gahee hundaaf marketplace tokko.", createAccount: "Account uumi", postFree: "Bilisa maxxansi", footerBody: "Qonnaan bulaa, oomishtaa, gurguraa, broker fi bitataa gabaa amanamaa tokko keessatti wal qunnamsiifna.", latestAds: "Maxxansa haaraa", company: "Company", support: "Deeggarsa", help: "Wiirtuu gargaarsaa", contact: "Quunnamtii", privacy: "Iccitii", rights: "Mirgi hundi eegamaa dha.", sampleListing: "MAXXANSA FAKKEENYAA", verified: "Profile mirkanaa’e", newProfile: "Profile haaraa", description: "Ibsa", postedBy: "Kan maxxanse", contactSeller: "Gurguraa quunnami", saved: "Kuufame", save: "Kuusi", sampleNote: "Kun fakkeenya maxxansaa qofa. Maxxansi haaraan namoota irraa dhufu marketplace irratti itti dabalama.", allEthiopia: "Itoophiyaa hunda", commission: "komishinii", notificationSaved: "Maxxansi saved keessatti kuufame.", notificationRemoved: "Maxxansi saved keessaa haqame.", listingAdded: "Maxxansi kee marketplace irratti baheera — device kana irratti kuufame.", registrationDone: "Galmeen kee milkaa’eera. Amma maxxansuu dandeessa.", welcome: "Baga nagaan dhuftan", loggedOut: "Account keessaa baateetta.", contactNumber: "Lakkoofsa quunnamtii", sampleContact: "Kun sample listing dha; contact dhugaa yeroo maxxansi haaraan ba’u mul’ata.",
  },
  en: {
    categories: "Categories", marketplace: "Marketplace", dashboard: "Dashboard", how: "How it works", notifications: "Notifications", noNotifications: "You have no new notifications.", logout: "Logout", login: "Login", register: "Register", postAd: "Post Ad", openMenu: "Open menu", mobileNav: "Mobile navigation", language: "Choose language", live: "Ethiopia’s multi-sector marketplace", heroOne: "Buy it. Sell it.", heroTwo: "Broker it.", heroBody: "Farm products, minerals, electronics, houses, construction materials and manufactured goods—all in one trusted Ethiopian market.", searchAria: "Search marketplace", searchPlaceholder: "What are you looking for?", locationAria: "Choose location", search: "Search", popular: "Popular:", activeListings: "Active listings", businessRoles: "Business roles", regionsCovered: "Regions covered", access: "Marketplace access", oneMarket: "ONE MARKET", buySellBroker: "Buy · Sell · Broker", verifiedSeller: "Verified seller", justNow: "just now", newBuyer: "New buyer request", tonsCoffee: "20 tons coffee", explore: "EXPLORE CATEGORIES", categoryTitle: "Everything your business needs.", categoryIntro: "Choose a category and discover sale listings, buyer requests and broker services.", ads: "ads", latest: "LATEST LISTINGS", opportunities: "Fresh opportunities for you", results: "results found", tradeFilter: "Filter listings by trade type", allAds: "All ads", forSale: "For sale", wanted: "Wanted", broker: "Broker", activeFilters: "Active filters", clearAll: "Clear all", sample: "SAMPLE", viewAria: "View", viewAd: "View ad", noListings: "No listings found", noListingsBody: "Try changing your search, location or filters.", clearFilters: "Clear all filters", rolesKicker: "MULTI-ROLE SYSTEM", rolesTitleOne: "Choose your role.", rolesTitleTwo: "Start your market.", rolesBody: "At FUAD ESMART, every user registers for their own role and sees only the form and marketplace tools they need.", freeRegister: "Register free", howKicker: "HOW IT WORKS", howTitle: "Start trading in four simple steps.", step1: "Register", step1Body: "Choose your role and complete your business profile.", step2: "Post an ad", step2Body: "Publish a sale, buy request or broker offer.", step3: "Find a match", step3Body: "Use search and filters to find the right partner.", step4: "Complete the trade", step4Body: "Verify the information and agree safely.", ctaTitle: "Start your market today.", ctaBody: "Your first listing is free. One marketplace for every role.", createAccount: "Create account", postFree: "Post Ad Free", footerBody: "We connect farmers, manufacturers, sellers, brokers and buyers in one trusted marketplace.", latestAds: "Latest ads", company: "Company", support: "Support", help: "Help center", contact: "Contact", privacy: "Privacy", rights: "All rights reserved.", sampleListing: "SAMPLE LISTING", verified: "Verified profile", newProfile: "New profile", description: "Description", postedBy: "Posted by", contactSeller: "Contact seller", saved: "Saved", save: "Save", sampleNote: "This is a sample listing. New listings published by users are added to the marketplace.", allEthiopia: "All Ethiopia", commission: "commission", notificationSaved: "The listing was added to Saved.", notificationRemoved: "The listing was removed from Saved.", listingAdded: "Your listing is live and saved on this device.", registrationDone: "Registration complete. You can now publish a listing.", welcome: "Welcome", loggedOut: "You have logged out.", contactNumber: "Contact number", sampleContact: "This is a sample listing. Contact details appear on new user listings.",
  },
  am: {
    categories: "ምድቦች", marketplace: "ገበያ", dashboard: "ዳሽቦርድ", how: "እንዴት ይሰራል", notifications: "ማሳወቂያዎች", noNotifications: "አዲስ ማሳወቂያ የለም።", logout: "ውጣ", login: "ግባ", register: "ተመዝገብ", postAd: "ማስታወቂያ ለጥፍ", openMenu: "ምናሌ ክፈት", mobileNav: "የሞባይል ምናሌ", language: "ቋንቋ ይምረጡ", live: "የኢትዮጵያ የብዙ ዘርፍ ገበያ", heroOne: "ይግዙ። ይሽጡ።", heroTwo: "ያደላልሉ።", heroBody: "የእርሻ ምርት፣ ማዕድን፣ ኤሌክትሮኒክስ፣ ቤት፣ የግንባታ ዕቃና የፋብሪካ ምርት—ሁሉም በአንድ አስተማማኝ የኢትዮጵያ ገበያ።", searchAria: "ገበያውን ፈልግ", searchPlaceholder: "ምን ይፈልጋሉ?", locationAria: "ቦታ ይምረጡ", search: "ፈልግ", popular: "ታዋቂ:", activeListings: "ንቁ ማስታወቂያዎች", businessRoles: "የንግድ ሚናዎች", regionsCovered: "የተሸፈኑ ክልሎች", access: "የገበያ መግቢያ", oneMarket: "አንድ ገበያ", buySellBroker: "ይግዙ · ይሽጡ · ያደላልሉ", verifiedSeller: "የተረጋገጠ ሻጭ", justNow: "አሁን", newBuyer: "አዲስ የግዢ ጥያቄ", tonsCoffee: "20 ቶን ቡና", explore: "ምድቦችን ይመልከቱ", categoryTitle: "ንግድዎ የሚፈልገው ሁሉ።", categoryIntro: "አንድ ምድብ ይምረጡ፤ የሽያጭ፣ የግዢና የደላላ ማስታወቂያዎችን ያግኙ።", ads: "ማስታወቂያ", latest: "አዲስ ማስታወቂያዎች", opportunities: "አዳዲስ ዕድሎች ለእርስዎ", results: "ውጤቶች ተገኝተዋል", tradeFilter: "በንግድ ዓይነት ያጣሩ", allAds: "ሁሉም", forSale: "ለሽያጭ", wanted: "ይፈለጋል", broker: "ደላላ", activeFilters: "የተመረጡ ማጣሪያዎች", clearAll: "ሁሉን አጥፋ", sample: "ምሳሌ", viewAria: "ይመልከቱ", viewAd: "ማስታወቂያ ይመልከቱ", noListings: "ማስታወቂያ አልተገኘም", noListingsBody: "ፍለጋ፣ ቦታ ወይም ማጣሪያ ይቀይሩ።", clearFilters: "ሁሉንም ማጣሪያ አጥፋ", rolesKicker: "የብዙ ሚና ስርዓት", rolesTitleOne: "ሚናዎን ይምረጡ።", rolesTitleTwo: "ገበያዎን ይጀምሩ።", rolesBody: "በFUAD ESMART እያንዳንዱ ሰው በሚናው ይመዘገባል፤ የሚያስፈልገውን ቅጽና የገበያ መሣሪያ ብቻ ያገኛል።", freeRegister: "በነፃ ይመዝገቡ", howKicker: "እንዴት ይሰራል", howTitle: "በአራት ቀላል ደረጃዎች ንግድ ይጀምሩ።", step1: "ይመዝገቡ", step1Body: "ሚናዎን ይምረጡና የንግድ ፕሮፋይልዎን ይሙሉ።", step2: "ማስታወቂያ ይለጥፉ", step2Body: "የሽያጭ፣ የግዢ ወይም የደላላ ማስታወቂያ ያውጡ።", step3: "ተዛማጅ ያግኙ", step3Body: "ትክክለኛ አጋር ለማግኘት ፍለጋና ማጣሪያ ይጠቀሙ።", step4: "ግብይቱን ይጨርሱ", step4Body: "መረጃውን ያረጋግጡና በደህና ይስማሙ።", ctaTitle: "ገበያዎን ዛሬ ይጀምሩ።", ctaBody: "የመጀመሪያ ማስታወቂያ ነፃ ነው። ለሁሉም ሚና አንድ ገበያ።", createAccount: "መለያ ይፍጠሩ", postFree: "በነፃ ይለጥፉ", footerBody: "ገበሬዎችን፣ አምራቾችን፣ ሻጮችን፣ ደላሎችንና ገዢዎችን በአንድ አስተማማኝ ገበያ እናገናኛለን።", latestAds: "አዲስ ማስታወቂያ", company: "ድርጅት", support: "ድጋፍ", help: "የእገዛ ማዕከል", contact: "ያግኙን", privacy: "ግላዊነት", rights: "መብቱ በሕግ የተጠበቀ ነው።", sampleListing: "የምሳሌ ማስታወቂያ", verified: "የተረጋገጠ ፕሮፋይል", newProfile: "አዲስ ፕሮፋይል", description: "መግለጫ", postedBy: "የለጠፈው", contactSeller: "ሻጩን ያግኙ", saved: "ተቀምጧል", save: "አስቀምጥ", sampleNote: "ይህ የምሳሌ ማስታወቂያ ነው። በተጠቃሚዎች የሚለጠፉ አዳዲስ ማስታወቂያዎች በገበያው ላይ ይጨመራሉ።", allEthiopia: "መላ ኢትዮጵያ", commission: "ኮሚሽን", notificationSaved: "ማስታወቂያው ተቀምጧል።", notificationRemoved: "ማስታወቂያው ከተቀመጡት ተወግዷል።", listingAdded: "ማስታወቂያዎ ወጥቶ በዚህ መሣሪያ ላይ ተቀምጧል።", registrationDone: "ምዝገባው ተሳክቷል። አሁን ማስታወቂያ መለጠፍ ይችላሉ።", welcome: "እንኳን ደህና መጡ", loggedOut: "ከመለያዎ ወጥተዋል።", contactNumber: "የመገኛ ቁጥር", sampleContact: "ይህ የምሳሌ ማስታወቂያ ነው፤ እውነተኛ መገኛ በአዲስ ማስታወቂያ ላይ ይታያል።",
  },
};

function transactionLabel(type: TransactionType, t: Record<string, string>) {
  if (type === "sell") return t.forSale.toUpperCase();
  if (type === "buy") return t.wanted.toUpperCase();
  return t.broker.toUpperCase();
}

function formatPrice(listing: Listing, t: Record<string, string>) {
  if (listing.priceSuffix === "percent") return `${listing.price}% ${t.commission}`;
  const suffix = listing.priceSuffix === "total" ? "" : ` / ${listing.priceSuffix}`;
  return `ETB ${listing.price.toLocaleString()}${suffix}`;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("om");
  const [languageReady, setLanguageReady] = useState(false);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("All Ethiopia");
  const [category, setCategory] = useState("all");
  const [transaction, setTransaction] = useState<"all" | TransactionType>("all");
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [postInitialTransaction, setPostInitialTransaction] = useState<TransactionType>("sell");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [account, setAccount] = useState<RegistrationPayload | null>(null);
  const [profile, setProfile] = useState<RegistrationPayload | null>(null);
  const [initialRole, setInitialRole] = useState<RoleId | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const t = pageCopy[language];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedProfile = JSON.parse(window.localStorage.getItem(LOCAL_PROFILE_KEY) ?? "null") as RegistrationPayload | null;
        const storedListings = JSON.parse(window.localStorage.getItem(LOCAL_LISTINGS_KEY) ?? "[]") as Listing[];
        const storedSaved = JSON.parse(window.localStorage.getItem(LOCAL_SAVED_KEY) ?? "[]") as string[];
        const storedLanguage = window.localStorage.getItem(LOCAL_LANGUAGE_KEY) as Language | null;
        setAccount(storedProfile);
        if (storedProfile && window.sessionStorage.getItem(SESSION_KEY) === "active") setProfile(storedProfile);
        if (Array.isArray(storedListings)) setUserListings(storedListings);
        if (Array.isArray(storedSaved)) setSavedIds(storedSaved);
        if (storedLanguage && languageOptions.some((item) => item.code === storedLanguage)) {
          setLanguage(storedLanguage);
        }
        setLanguageReady(true);
      } catch {
        window.localStorage.removeItem(LOCAL_LISTINGS_KEY);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!languageReady) return;
    window.localStorage.setItem(LOCAL_LANGUAGE_KEY, language);
    document.documentElement.setAttribute("lang", language);
  }, [language, languageReady]);

  const localizedDemoListings = useMemo(() => {
    if (language === "en") return demoListings;
    return demoListings.map((listing) => ({ ...listing, ...demoListingTranslations[language][listing.id] }));
  }, [language]);

  const listings = useMemo(() => [...userListings, ...localizedDemoListings], [localizedDemoListings, userListings]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileMenuOpen(false);
      setProfileMenuOpen(false);
      setSelectedListing(null);
      setDashboardOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const filteredListings = useMemo(() => {
    const search = query.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesSearch = !search || [listing.title, listing.categoryLabel, listing.location, listing.seller, listing.role, listing.condition, listing.description].join(" ").toLowerCase().includes(search);
      const matchesLocation = location === "All Ethiopia" || listing.location === location;
      const matchesCategory = category === "all" || listing.category === category;
      const matchesTransaction = transaction === "all" || listing.transaction === transaction;
      return matchesSearch && matchesLocation && matchesCategory && matchesTransaction;
    });
  }, [category, listings, location, query, transaction]);

  const hasActiveFilters = Boolean(query.trim()) || location !== "All Ethiopia" || category !== "all" || transaction !== "all";
  const profileRole = roleOptions.find((item) => item.id === profile?.role);

  function chooseLanguage(next: Language) {
    setLanguage(next);
    setMobileMenuOpen(false);
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4200);
  }

  function clearFilters() {
    setQuery("");
    setLocation("All Ethiopia");
    setCategory("all");
    setTransaction("all");
  }

  function selectCategory(id: string) {
    setCategory(id);
    setMobileMenuOpen(false);
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function quickSearch(value: string) {
    setQuery(value);
    setCategory("all");
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startRegistration(role: RoleId | null = null) {
    setInitialRole(role);
    setLoginOpen(false);
    setMobileMenuOpen(false);
    setRegisterOpen(true);
  }

  function openPost(transaction: TransactionType = "sell") {
    setPostInitialTransaction(transaction);
    setDashboardOpen(false);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setPostOpen(true);
  }

  function openDashboard() {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    if (profile) setDashboardOpen(true);
    else if (account) setLoginOpen(true);
    else startRegistration();
  }

  function browseFromDashboard() {
    setDashboardOpen(false);
    window.setTimeout(() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }

  function addListing(listing: Listing) {
    setUserListings((current) => {
      const next = [listing, ...current];
      window.localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(next));
      return next;
    });
    setCategory("all");
    setTransaction("all");
    showNotice(t.listingAdded);
  }

  function completeRegistration(payload: RegistrationPayload) {
    window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(payload));
    window.sessionStorage.setItem(SESSION_KEY, "active");
    setAccount(payload);
    setProfile(payload);
    showNotice(t.registrationDone);
  }

  function completeLogin(payload: RegistrationPayload) {
    window.sessionStorage.setItem(SESSION_KEY, "active");
    setProfile(payload);
    setLoginOpen(false);
    showNotice(`${t.welcome}, ${payload.fullName.split(" ")[0]}!`);
  }

  function logout() {
    window.sessionStorage.removeItem(SESSION_KEY);
    setProfile(null);
    setDashboardOpen(false);
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    showNotice(t.loggedOut);
  }

  function toggleSaved(id: string) {
    const next = savedIds.includes(id) ? savedIds.filter((item) => item !== id) : [...savedIds, id];
    setSavedIds(next);
    window.localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(next));
    showNotice(next.includes(id) ? t.notificationSaved : t.notificationRemoved);
  }

  function contactSelected() {
    if (!selectedListing) return;
    if (selectedListing.phone) showNotice(`${t.contactNumber}: ${selectedListing.phone}`);
    else showNotice(t.sampleContact);
    setSelectedListing(null);
  }

  return (
    <main className="marketplace-app">
      <header className="market-header">
        <a className="esmart-brand" href="#top" aria-label="FUAD ESMART Marketplace home">
          <span className="esmart-mark">FE</span>
          <span><strong>FUAD ESMART</strong><small>TRADING PLC · MARKETPLACE</small></span>
        </a>
        <nav aria-label={t.mobileNav}>
          <a href="#categories">{t.categories}</a>
          <a href="#listings">{t.marketplace}</a>
          <a href="#how">{t.how}</a>
        </nav>
        <div className="market-actions">
          <div className="language-switcher header-language-switcher" role="group" aria-label={t.language}>
            {languageOptions.map((item) => <button className={language === item.code ? "active" : ""} type="button" key={item.code} aria-pressed={language === item.code} title={item.label} onClick={() => chooseLanguage(item.code)}>{item.short}</button>)}
          </div>
          <button className="notification-button" type="button" aria-label={t.notifications} onClick={() => showNotice(t.noNotifications)}><span>🔔</span></button>
          {profile ? (
            <div className="profile-menu-wrap">
              <button className="profile-chip" type="button" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((current) => !current)}><span>{profile.fullName.slice(0, 1).toUpperCase()}</span><small>{profile.fullName.split(" ")[0]}</small></button>
              {profileMenuOpen && <div className="profile-popover"><span>{profileRole?.icon ?? "👤"}</span><div><strong>{profile.fullName}</strong><small>{profileRole ? getRoleName(profileRole, language) : profile.role}</small></div><div className="profile-popover-actions"><button className="open-dashboard-action" type="button" onClick={openDashboard}>{t.dashboard}</button><button type="button" onClick={logout}>{t.logout}</button></div></div>}
            </div>
          ) : (
            <><button className="header-login" type="button" onClick={() => setLoginOpen(true)}>{t.login}</button><button className="header-register" type="button" onClick={() => startRegistration()}>{t.register}</button></>
          )}
          <button className="post-ad-button ripple" type="button" onClick={() => openPost()}><span>＋</span> {t.postAd}</button>
          <button className="mobile-menu-button" type="button" aria-label={t.openMenu} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((current) => !current)}><span /><span /><span /></button>
        </div>
        {mobileMenuOpen && (
          <nav className="mobile-market-menu" aria-label={t.mobileNav}>
            <div className="mobile-language-row"><span>{t.language}</span><div className="language-switcher" role="group" aria-label={t.language}>{languageOptions.map((item) => <button className={language === item.code ? "active" : ""} type="button" key={item.code} aria-pressed={language === item.code} onClick={() => chooseLanguage(item.code)}>{item.short}</button>)}</div></div>
            <a href="#categories" onClick={() => setMobileMenuOpen(false)}>{t.categories} <span>→</span></a>
            <a href="#listings" onClick={() => setMobileMenuOpen(false)}>{t.marketplace} <span>→</span></a>
            <a href="#how" onClick={() => setMobileMenuOpen(false)}>{t.how} <span>→</span></a>
            <div className="mobile-account-actions">
              {profile ? <><div><span>{profileRole?.icon ?? "👤"}</span><strong>{profile.fullName}</strong></div><button className="mobile-dashboard-action" type="button" onClick={openDashboard}>{t.dashboard}</button><button type="button" onClick={logout}>{t.logout}</button></> : <><button type="button" onClick={() => { setMobileMenuOpen(false); setLoginOpen(true); }}>{t.login}</button><button className="mobile-register" type="button" onClick={() => startRegistration()}>{t.register}</button></>}
            </div>
          </nav>
        )}
      </header>

      <section className="market-hero" id="top">
        <div className="hero-glow glow-one" /><div className="hero-glow glow-two" />
        <div className="hero-market-copy">
          <div className="live-pill"><i /> {t.live}</div>
          <h1>{t.heroOne}<br /><em>{t.heroTwo}</em></h1>
          <p>{t.heroBody}</p>
          <form className="universal-search" onSubmit={(event) => { event.preventDefault(); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
            <label className="hero-search-field"><span aria-hidden="true">⌕</span><span className="sr-only">{t.searchAria}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} /></label>
            <label className="hero-location-field"><span aria-hidden="true">⌖</span><span className="sr-only">{t.locationAria}</span><select value={location} onChange={(event) => setLocation(event.target.value)}>{locations.map((item) => <option key={item} value={item}>{item === "All Ethiopia" ? t.allEthiopia : item}</option>)}</select></label>
            <button className="hero-search-button ripple" type="submit">{t.search}</button>
          </form>
          <div className="hero-quick-links"><span>{t.popular}</span><button type="button" onClick={() => quickSearch("Laptop")}>Laptop</button>{["mineral", "farm", "property", "livestock"].map((id) => { const item = listingCategories.find((entry) => entry.id === id)!; return <button type="button" key={id} onClick={() => selectCategory(id)}>{getCategoryName(item, language)}</button>; })}</div>
          <div className="market-stats">
            <div><strong>16K+</strong><span>{t.activeListings}</span></div>
            <div><strong>7</strong><span>{t.businessRoles}</span></div>
            <div><strong>12</strong><span>{t.regionsCovered}</span></div>
            <div><strong>24/7</strong><span>{t.access}</span></div>
          </div>
        </div>

        <div className="hero-market-visual" aria-label="Marketplace activity illustration">
          <div className="trade-orbit orbit-a"><span>🌾</span></div>
          <div className="trade-orbit orbit-b"><span>💻</span></div>
          <div className="trade-orbit orbit-c"><span>🪨</span></div>
          <div className="trade-orbit orbit-d"><span>🏠</span></div>
          <div className="trade-core"><span className="core-logo">FE</span><strong>{t.oneMarket}</strong><small>{t.buySellBroker}</small></div>
          <div className="floating-deal deal-one"><span>✓</span><div><strong>{t.verifiedSeller}</strong><small>Adama · {t.justNow}</small></div></div>
          <div className="floating-deal deal-two"><span>↗</span><div><strong>{t.newBuyer}</strong><small>{t.tonsCoffee}</small></div></div>
          <svg className="orbit-lines" viewBox="0 0 500 500" aria-hidden="true"><circle cx="250" cy="250" r="171" /><circle cx="250" cy="250" r="115" /></svg>
        </div>
      </section>

      <section className="category-section" id="categories">
        <div className="market-section-heading"><div><span>{t.explore}</span><h2>{t.categoryTitle}</h2></div><p>{t.categoryIntro}</p></div>
        <div className="market-category-grid">
          {listingCategories.map((item, index) => (
            <button className={`market-category-card ${item.accent} ${category === item.id ? "active" : ""}`} style={{ animationDelay: `${index * 55}ms` }} key={item.id} type="button" aria-pressed={category === item.id} onClick={() => selectCategory(item.id)}>
              <span className="category-art">{item.icon}</span><span className="category-info"><strong>{getCategoryName(item, language)}</strong><small>{language === "en" ? item.oromo : item.label}</small><em>{item.count} {t.ads}</em></span><i>→</i>
            </button>
          ))}
        </div>
      </section>

      <section className="listings-section" id="listings">
        <div className="listing-toolbar">
          <div><span>{category === "all" ? t.latest : getCategoryName(listingCategories.find((item) => item.id === category)!, language).toUpperCase()}</span><h2>{category === "all" ? t.opportunities : getCategoryName(listingCategories.find((item) => item.id === category)!, language)}</h2><p>{filteredListings.length} {t.results}</p></div>
          <div className="transaction-tabs" role="group" aria-label={t.tradeFilter}>
            {(["all", "sell", "buy", "broker"] as const).map((item) => <button className={transaction === item ? "active" : ""} key={item} type="button" aria-pressed={transaction === item} onClick={() => setTransaction(item)}>{item === "all" ? t.allAds : item === "sell" ? t.forSale : item === "buy" ? t.wanted : t.broker}</button>)}
          </div>
        </div>

        {hasActiveFilters && <div className="active-filter-row" aria-label={t.activeFilters}><span>{t.activeFilters}</span>{query.trim() && <button type="button" onClick={() => setQuery("")}>⌕ {query} ×</button>}{location !== "All Ethiopia" && <button type="button" onClick={() => setLocation("All Ethiopia")}>⌖ {location} ×</button>}{category !== "all" && <button type="button" onClick={() => setCategory("all")}>{listingCategories.find((item) => item.id === category)?.icon} {getCategoryName(listingCategories.find((item) => item.id === category)!, language)} ×</button>}{transaction !== "all" && <button type="button" onClick={() => setTransaction("all")}>{transactionLabel(transaction, t)} ×</button>}<button className="clear-filter-button" type="button" onClick={clearFilters}>{t.clearAll}</button></div>}

        {filteredListings.length ? (
          <div className="listing-grid">
            {filteredListings.map((listing, index) => (
              <article className="listing-card" style={{ animationDelay: `${Math.min(index, 7) * 60}ms` }} key={listing.id}>
                <button className={`listing-visual ${listing.accent}`} type="button" onClick={() => setSelectedListing(listing)} aria-label={`${t.viewAria} ${listing.title}`}>
                  <span className="listing-icon">{listing.icon}</span>
                  <span className={`trade-badge ${listing.transaction}`}>{transactionLabel(listing.transaction, t)}</span>
                  {listing.sample && <span className="sample-badge">{t.sample}</span>}
                  <span className={`heart ${savedIds.includes(listing.id) ? "saved" : ""}`} aria-hidden="true">{savedIds.includes(listing.id) ? "♥" : "♡"}</span>
                </button>
                <div className="listing-body">
                  <div className="listing-meta"><span>{listingCategories.find((item) => item.id === listing.category) ? getCategoryName(listingCategories.find((item) => item.id === listing.category)!, language) : listing.categoryLabel}</span><span>⌖ {listing.location}</span></div>
                  <button className="listing-title" type="button" onClick={() => setSelectedListing(listing)}>{listing.title}</button>
                  <p>{listing.description}</p>
                  <div className="seller-line"><span>{listing.seller.slice(0, 1)}</span><div><strong>{listing.seller}</strong><small>{listing.verified && <i>✓</i>} {listing.role}</small></div><time>{listing.time}</time></div>
                  <div className="listing-price"><strong>{formatPrice(listing, t)}</strong><button type="button" onClick={() => setSelectedListing(listing)}>{t.viewAd} <span>→</span></button></div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-listings"><span>⌕</span><h3>{t.noListings}</h3><p>{t.noListingsBody}</p><button type="button" onClick={clearFilters}>{t.clearFilters}</button></div>
        )}
      </section>

      <section className="roles-showcase" id="how">
        <div className="roles-copy"><span>{t.rolesKicker}</span><h2>{t.rolesTitleOne}<br />{t.rolesTitleTwo}</h2><p>{t.rolesBody}</p><button className="light-action ripple" type="button" onClick={() => startRegistration()}>{t.freeRegister} <span>→</span></button></div>
        <div className="roles-map">
          {roleOptions.map((role, index) => <button className="mini-role-card" style={{ animationDelay: `${index * 80}ms` }} type="button" key={role.id} onClick={() => startRegistration(role.id)}><span>{role.icon}</span><strong>{getRoleName(role, language)}</strong><small>{language === "en" ? role.label : role.english}</small></button>)}
        </div>
      </section>

      <section className="market-steps">
        <div className="market-section-heading centered"><div><span>{t.howKicker}</span><h2>{t.howTitle}</h2></div></div>
        <div className="how-grid"><article><span>01</span><i>◎</i><h3>{t.step1}</h3><p>{t.step1Body}</p></article><article><span>02</span><i>＋</i><h3>{t.step2}</h3><p>{t.step2Body}</p></article><article><span>03</span><i>⌕</i><h3>{t.step3}</h3><p>{t.step3Body}</p></article><article><span>04</span><i>✓</i><h3>{t.step4}</h3><p>{t.step4Body}</p></article></div>
      </section>

      <section className="final-cta">
        <div><span>FUAD ESMART TRADING PLC</span><h2>{t.ctaTitle}</h2><p>{t.ctaBody}</p></div><div><button className="cta-register ripple" type="button" onClick={() => startRegistration()}>{t.createAccount}</button><button className="cta-post ripple" type="button" onClick={() => openPost()}>＋ {t.postFree}</button></div>
      </section>

      <footer className="market-footer">
        <div className="footer-main"><div className="footer-brand-wide"><span className="esmart-mark">FE</span><div><strong>FUAD ESMART</strong><small>TRADING PLC · ETHIOPIA</small></div></div><p>{t.footerBody}</p></div>
        <div><strong>{t.marketplace}</strong><a href="#categories">{t.categories}</a><a href="#listings">{t.latestAds}</a><button type="button" onClick={() => openPost()}>{t.postAd}</button></div>
        <div><strong>{t.company}</strong><a href="#how">{t.how}</a><button type="button" onClick={() => startRegistration()}>{t.register}</button><button type="button" onClick={() => setLoginOpen(true)}>{t.login}</button></div>
        <div><strong>{t.support}</strong><a href="#top">{t.help}</a><a href="#top">{t.contact}</a><a href="#top">{t.privacy}</a></div>
        <small>© 2026 FUAD ESMART TRADING PLC. {t.rights}</small>
      </footer>

      {registerOpen && <MultiRoleRegister open initialRole={initialRole} language={language} onClose={() => { setRegisterOpen(false); setInitialRole(null); }} onComplete={completeRegistration} />}
      {loginOpen && <LocalLogin open account={account} language={language} onClose={() => setLoginOpen(false)} onLogin={completeLogin} onRegister={() => startRegistration()} />}
      {postOpen && <PostAdFlow open language={language} initialTransaction={postInitialTransaction} onClose={() => setPostOpen(false)} onComplete={addListing} defaultSeller={profile?.fullName ?? ""} />}
      {dashboardOpen && profile && <RoleDashboard open profile={profile} listings={listings} savedIds={savedIds} language={language} onClose={() => setDashboardOpen(false)} onPost={openPost} onBrowse={browseFromDashboard} onSelectListing={setSelectedListing} onLogout={logout} />}

      {selectedListing && (
        <div className="flow-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedListing(null); }}>
          <section className="listing-detail" role="dialog" aria-modal="true" aria-labelledby="listing-detail-title">
            <button className="flow-close" type="button" onClick={() => setSelectedListing(null)} aria-label={t.clearAll}>×</button>
            <div className={`detail-visual ${selectedListing.accent}`}><span>{selectedListing.icon}</span><i className={`trade-badge ${selectedListing.transaction}`}>{transactionLabel(selectedListing.transaction, t)}</i>{selectedListing.sample && <em>{t.sampleListing}</em>}</div>
            <div className="detail-content">
              <span className="detail-category">{listingCategories.find((item) => item.id === selectedListing.category) ? getCategoryName(listingCategories.find((item) => item.id === selectedListing.category)!, language) : selectedListing.categoryLabel} · {selectedListing.condition}</span>
              <h2 id="listing-detail-title">{selectedListing.title}</h2>
              <strong className="detail-price">{formatPrice(selectedListing, t)}</strong>
              <div className="detail-facts"><span>⌖ {selectedListing.location}</span><span>◷ {selectedListing.time}</span><span>{selectedListing.verified ? `✓ ${t.verified}` : t.newProfile}</span></div>
              <h3>{t.description}</h3><p>{selectedListing.description}</p>
              <div className="detail-seller"><span>{selectedListing.seller.slice(0, 1)}</span><div><small>{t.postedBy}</small><strong>{selectedListing.seller}</strong><em>{selectedListing.role}</em></div></div>
              <div className="detail-actions"><button className="contact-action ripple" type="button" onClick={contactSelected}>☎ {t.contactSeller}</button><button className={`save-action ${savedIds.includes(selectedListing.id) ? "saved" : ""}`} type="button" aria-pressed={savedIds.includes(selectedListing.id)} onClick={() => toggleSaved(selectedListing.id)}>{savedIds.includes(selectedListing.id) ? `♥ ${t.saved}` : `♡ ${t.save}`}</button></div>
              {selectedListing.sample && <p className="sample-note">{t.sampleNote}</p>}
            </div>
          </section>
        </div>
      )}

      {notice && <div className="toast-notice" role="status"><span>✓</span><p>{notice}</p></div>}
    </main>
  );
}
