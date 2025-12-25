// Vehicle Makes and Models data for India
export const vehicleMakes = [
  "Maruti Suzuki",
  "Hyundai",
  "Tata",
  "Mahindra",
  "Kia",
  "Honda",
  "Toyota",
  "Renault",
  "Nissan",
  "Volkswagen",
  "Skoda",
  "MG",
  "Ford",
  "Jeep",
  "Citroen",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volvo",
  "Jaguar",
  "Land Rover",
  "Porsche",
  "Lexus",
  "Mini",
  "Isuzu",
  "Force Motors",
  "BYD",
  "Ashok Leyland",
  "Eicher",
  "Pickup Vehicles",
  "Others"
].sort();

export const vehicleModels: Record<string, string[]> = {
  "Maruti Suzuki": [
    "Alto", "Alto K10", "S-Presso", "WagonR", "Celerio", "Swift", "Dzire",
    "Baleno", "Fronx", "Ignis", "Ciaz", "Ertiga", "XL6", "Brezza", "Grand Vitara",
    "Jimny", "Eeco", "S-Cross", "Super Carry"
  ].sort(),
  
  "Hyundai": [
    "Santro", "Grand i10 Nios", "i20", "i20 N Line", "Aura", "Verna",
    "Elantra", "Venue", "Venue N Line", "Creta", "Alcazar", "Tucson",
    "Kona Electric", "Ioniq 5"
  ].sort(),
  
  "Tata": [
    "Tiago", "Tiago NRG", "Tigor", "Tigor EV", "Altroz", "Altroz Racer",
    "Punch", "Nexon", "Nexon EV", "Harrier", "Safari", "Curvv", "Curvv EV"
  ].sort(),
  
  "Mahindra": [
    "KUV100 NXT", "XUV300", "Bolero", "Bolero Neo", "Thar", "Scorpio Classic",
    "Scorpio N", "XUV700", "XUV400", "Marazzo", "Alturas G4"
  ].sort(),
  
  "Kia": [
    "Sonet", "Seltos", "Carens", "Carnival", "EV6", "EV9"
  ].sort(),
  
  "Honda": [
    "Amaze", "City", "City e:HEV", "Elevate", "CR-V"
  ].sort(),
  
  "Toyota": [
    "Glanza", "Urban Cruiser Taisor", "Rumion", "Innova Crysta", "Innova Hycross",
    "Fortuner", "Hilux", "Land Cruiser", "Camry", "Vellfire"
  ].sort(),
  
  "Renault": [
    "Kwid", "Triber", "Kiger", "Duster"
  ].sort(),
  
  "Nissan": [
    "Magnite", "X-Trail"
  ].sort(),
  
  "Volkswagen": [
    "Polo", "Vento", "Taigun", "Virtus", "Tiguan"
  ].sort(),
  
  "Skoda": [
    "Kushaq", "Slavia", "Kodiaq", "Superb"
  ].sort(),
  
  "MG": [
    "Comet EV", "Hector", "Hector Plus", "Astor", "ZS EV", "Gloster"
  ].sort(),
  
  "Ford": [
    "EcoSport", "Endeavour", "Mustang"
  ].sort(),
  
  "Jeep": [
    "Compass", "Meridian", "Wrangler", "Grand Cherokee"
  ].sort(),
  
  "Citroen": [
    "C3", "C3 Aircross", "eC3", "C5 Aircross"
  ].sort(),
  
  "BMW": [
    "2 Series Gran Coupe", "3 Series", "5 Series", "7 Series", "X1", "X3",
    "X4", "X5", "X6", "X7", "iX", "i4", "i7", "Z4"
  ].sort(),
  
  "Mercedes-Benz": [
    "A-Class Limousine", "C-Class", "E-Class", "S-Class", "GLA", "GLB",
    "GLC", "GLE", "GLS", "EQB", "EQE", "EQS", "G-Class", "Maybach"
  ].sort(),
  
  "Audi": [
    "A4", "A6", "A8 L", "Q3", "Q5", "Q7", "Q8", "e-tron", "e-tron GT"
  ].sort(),
  
  "Volvo": [
    "XC40", "XC60", "XC90", "S90", "C40 Recharge", "XC40 Recharge"
  ].sort(),
  
  "Jaguar": [
    "XE", "XF", "F-Pace", "E-Pace", "I-Pace"
  ].sort(),
  
  "Land Rover": [
    "Discovery Sport", "Discovery", "Range Rover Evoque", "Range Rover Velar",
    "Range Rover Sport", "Range Rover", "Defender"
  ].sort(),
  
  "Porsche": [
    "718", "911", "Panamera", "Macan", "Cayenne", "Taycan"
  ].sort(),
  
  "Lexus": [
    "ES", "LS", "NX", "RX", "LX"
  ].sort(),
  
  "Mini": [
    "Cooper 3 Door", "Cooper 5 Door", "Cooper Countryman"
  ].sort(),
  
  "Isuzu": [
    "D-Max V-Cross", "MU-X"
  ].sort(),
  
  "Force Motors": [
    "Gurkha", "Urbania", "Trax Cruiser"
  ].sort(),
  
  "BYD": [
    "Atto 3", "e6", "Seal"
  ].sort(),
  
  "Ashok Leyland": [
    "Dost", "Bada Dost", "Partner", "MiTR", "Ecomet"
  ].sort(),
  
  "Eicher": [
    "Pro 1049", "Pro 1059", "Pro 1080", "Pro 2049", "Pro 2059", "Pro 2095XP"
  ].sort(),
  
  "Pickup Vehicles": [
    "Tata Intra V10", "Tata Ace", "Mahindra Bolero Pickup", "Ashok Leyland Dost", 
    "Isuzu D-Max V-Cross", "Isuzu D-Max S-Cab", "Mahindra Scorpio Getaway",
    "Tata Xenon", "Tata Yodha", "Mahindra Imperio", "Force Trax Cruiser"
  ].sort(),
  
  "Others": [
    "Other Model"
  ]
};

export const insuranceCompanies = [
  "Bajaj Allianz General Insurance",
  "ICICI Lombard General Insurance",
  "HDFC ERGO General Insurance",
  "Reliance General Insurance",
  "Tata AIG General Insurance",
  "New India Assurance",
  "National Insurance Company",
  "United India Insurance",
  "Oriental Insurance",
  "IFFCO Tokio General Insurance",
  "Cholamandalam MS General Insurance",
  "Royal Sundaram General Insurance",
  "SBI General Insurance",
  "Bharti AXA General Insurance",
  "Digit Insurance",
  "Acko General Insurance",
  "Go Digit General Insurance",
  "Kotak Mahindra General Insurance",
  "Universal Sompo General Insurance",
  "Liberty General Insurance",
  "Magma HDI General Insurance",
  "Future Generali India Insurance",
  "Raheja QBE General Insurance",
  "Shriram General Insurance",
  "Edelweiss General Insurance",
  "Zuno General Insurance",
  "Others"
].sort();
