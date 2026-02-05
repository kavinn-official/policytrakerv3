import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Car, Heart, Shield, ArrowRight, Info, IndianRupee } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const PremiumCalculatorPage = () => {
  // Motor Insurance State
  const [vehicleType, setVehicleType] = useState("car");
  const [vehicleAge, setVehicleAge] = useState("");
  const [idv, setIdv] = useState("");
  const [ncbPercent, setNcbPercent] = useState("0");
  const [hasZeroDepreciation, setHasZeroDepreciation] = useState(false);
  const [hasEngineProtect, setHasEngineProtect] = useState(false);
  const [motorPremium, setMotorPremium] = useState<number | null>(null);

  // Health Insurance State
  const [age, setAge] = useState("");
  const [sumInsured, setSumInsured] = useState("500000");
  const [familyMembers, setFamilyMembers] = useState("1");
  const [hasPreExisting, setHasPreExisting] = useState(false);
  const [healthPremium, setHealthPremium] = useState<number | null>(null);

  // Life Insurance State
  const [lifeAge, setLifeAge] = useState("");
  const [lifeSumAssured, setLifeSumAssured] = useState("10000000");
  const [policyTerm, setPolicyTerm] = useState("20");
  const [isSmoker, setIsSmoker] = useState(false);
  const [lifePremium, setLifePremium] = useState<number | null>(null);

  const calculateMotorPremium = () => {
    const idvValue = parseFloat(idv) || 0;
    const ageValue = parseInt(vehicleAge) || 0;
    
    // Base rate calculation
    let baseRate = vehicleType === "car" ? 0.028 : vehicleType === "bike" ? 0.015 : 0.035;
    
    // Age factor
    if (ageValue <= 1) baseRate *= 1.0;
    else if (ageValue <= 3) baseRate *= 1.1;
    else if (ageValue <= 5) baseRate *= 1.2;
    else baseRate *= 1.35;

    // Own damage premium
    let odPremium = idvValue * baseRate;
    
    // Third party premium (fixed)
    const tpPremium = vehicleType === "car" ? 2094 : vehicleType === "bike" ? 714 : 15000;
    
    // Add-ons
    if (hasZeroDepreciation) odPremium += idvValue * 0.008;
    if (hasEngineProtect) odPremium += idvValue * 0.005;
    
    // NCB discount
    const ncbDiscount = parseFloat(ncbPercent) / 100;
    odPremium = odPremium * (1 - ncbDiscount);
    
    // Total premium with GST
    const totalPremium = (odPremium + tpPremium) * 1.18;
    
    setMotorPremium(Math.round(totalPremium));
  };

  const calculateHealthPremium = () => {
    const ageValue = parseInt(age) || 30;
    const sumValue = parseInt(sumInsured) || 500000;
    const members = parseInt(familyMembers) || 1;
    
    // Base rate per lakh
    let baseRatePerLakh = 250;
    
    // Age factor
    if (ageValue <= 25) baseRatePerLakh = 180;
    else if (ageValue <= 35) baseRatePerLakh = 220;
    else if (ageValue <= 45) baseRatePerLakh = 300;
    else if (ageValue <= 55) baseRatePerLakh = 450;
    else baseRatePerLakh = 700;
    
    // Calculate base premium
    let premium = (sumValue / 100000) * baseRatePerLakh;
    
    // Family floater discount
    if (members > 1) {
      premium = premium * (1 + (members - 1) * 0.35);
    }
    
    // Pre-existing loading
    if (hasPreExisting) premium *= 1.25;
    
    // Add GST
    premium *= 1.18;
    
    setHealthPremium(Math.round(premium));
  };

  const calculateLifePremium = () => {
    const ageValue = parseInt(lifeAge) || 30;
    const sumValue = parseInt(lifeSumAssured) || 10000000;
    const term = parseInt(policyTerm) || 20;
    
    // Base rate per lakh per year
    let baseRatePerLakh = 8;
    
    // Age factor
    if (ageValue <= 25) baseRatePerLakh = 5;
    else if (ageValue <= 30) baseRatePerLakh = 6;
    else if (ageValue <= 35) baseRatePerLakh = 8;
    else if (ageValue <= 40) baseRatePerLakh = 12;
    else if (ageValue <= 45) baseRatePerLakh = 18;
    else if (ageValue <= 50) baseRatePerLakh = 28;
    else baseRatePerLakh = 45;
    
    // Calculate premium
    let premium = (sumValue / 100000) * baseRatePerLakh;
    
    // Term adjustment
    if (term > 25) premium *= 1.1;
    if (term > 30) premium *= 1.15;
    
    // Smoker loading
    if (isSmoker) premium *= 1.5;
    
    // Add GST
    premium *= 1.18;
    
    setLifePremium(Math.round(premium));
  };

  return (
    <>
      <SEOHead 
        title="Insurance Premium Calculator | Motor, Health & Life Insurance | Policy Tracker"
        description="Free insurance premium calculator for agents. Calculate motor insurance, health insurance, and life insurance premiums instantly. Estimate premiums for your clients."
        canonicalPath="/calculator"
        keywords="insurance premium calculator, motor insurance calculator, health insurance premium, life insurance premium calculator, car insurance calculator India"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Policy Tracker" className="h-8 w-8" loading="lazy" />
              <span className="text-xl font-bold text-primary">Policy Tracker</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/blog" className="hidden md:block text-gray-600 hover:text-primary">
                Blog
              </Link>
              <Link to="/pricing" className="hidden md:block text-gray-600 hover:text-primary">
                Pricing
              </Link>
              <Link to="/auth">
                <Button>Get Started Free</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-primary/5 to-cyan-50">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Calculator className="h-3 w-3 mr-1" />
              Free Tool for Agents
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Insurance <span className="text-primary">Premium Calculator</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Quickly estimate insurance premiums for your clients. Calculate motor, health, and life insurance premiums with our free tool.
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Tabs defaultValue="motor" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="motor" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <span className="hidden sm:inline">Motor</span>
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Health</span>
                </TabsTrigger>
                <TabsTrigger value="life" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Life</span>
                </TabsTrigger>
              </TabsList>

              {/* Motor Insurance Calculator */}
              <TabsContent value="motor">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-primary" />
                      Motor Insurance Premium Calculator
                    </CardTitle>
                    <CardDescription>
                      Estimate comprehensive motor insurance premium for cars, bikes, and commercial vehicles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Vehicle Type</Label>
                        <Select value={vehicleType} onValueChange={setVehicleType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="car">Private Car</SelectItem>
                            <SelectItem value="bike">Two Wheeler</SelectItem>
                            <SelectItem value="commercial">Commercial Vehicle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Vehicle Age (Years)</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g., 3"
                          value={vehicleAge}
                          onChange={(e) => setVehicleAge(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>IDV (Insured Declared Value)</Label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            type="number" 
                            placeholder="e.g., 500000"
                            className="pl-10"
                            value={idv}
                            onChange={(e) => setIdv(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>NCB (No Claim Bonus)</Label>
                        <Select value={ncbPercent} onValueChange={setNcbPercent}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0% - No NCB</SelectItem>
                            <SelectItem value="20">20% - 1 Year</SelectItem>
                            <SelectItem value="25">25% - 2 Years</SelectItem>
                            <SelectItem value="35">35% - 3 Years</SelectItem>
                            <SelectItem value="45">45% - 4 Years</SelectItem>
                            <SelectItem value="50">50% - 5+ Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Add-ons</Label>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="zeroDepreciation" 
                            checked={hasZeroDepreciation}
                            onCheckedChange={(checked) => setHasZeroDepreciation(!!checked)}
                          />
                          <Label htmlFor="zeroDepreciation" className="text-sm cursor-pointer">Zero Depreciation</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="engineProtect"
                            checked={hasEngineProtect}
                            onCheckedChange={(checked) => setHasEngineProtect(!!checked)}
                          />
                          <Label htmlFor="engineProtect" className="text-sm cursor-pointer">Engine Protection</Label>
                        </div>
                      </div>
                    </div>

                    <Button onClick={calculateMotorPremium} className="w-full" size="lg">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Premium
                    </Button>

                    {motorPremium !== null && (
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-6 text-center">
                          <p className="text-sm text-gray-600 mb-2">Estimated Annual Premium</p>
                          <p className="text-4xl font-bold text-primary">
                            ₹{motorPremium.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                            <Info className="h-3 w-3" />
                            Inclusive of 18% GST
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Health Insurance Calculator */}
              <TabsContent value="health">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      Health Insurance Premium Calculator
                    </CardTitle>
                    <CardDescription>
                      Estimate health insurance premium for individuals and family floater plans.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Age of Eldest Member</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g., 35"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Sum Insured</Label>
                        <Select value={sumInsured} onValueChange={setSumInsured}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="300000">₹3 Lakh</SelectItem>
                            <SelectItem value="500000">₹5 Lakh</SelectItem>
                            <SelectItem value="1000000">₹10 Lakh</SelectItem>
                            <SelectItem value="1500000">₹15 Lakh</SelectItem>
                            <SelectItem value="2500000">₹25 Lakh</SelectItem>
                            <SelectItem value="5000000">₹50 Lakh</SelectItem>
                            <SelectItem value="10000000">₹1 Crore</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Number of Family Members</Label>
                        <Select value={familyMembers} onValueChange={setFamilyMembers}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 (Individual)</SelectItem>
                            <SelectItem value="2">2 (Self + Spouse)</SelectItem>
                            <SelectItem value="3">3 (Family of 3)</SelectItem>
                            <SelectItem value="4">4 (Family of 4)</SelectItem>
                            <SelectItem value="5">5+ (Large Family)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Pre-existing Conditions</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox 
                            id="preExisting"
                            checked={hasPreExisting}
                            onCheckedChange={(checked) => setHasPreExisting(!!checked)}
                          />
                          <Label htmlFor="preExisting" className="text-sm cursor-pointer">
                            Yes, has pre-existing conditions
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Button onClick={calculateHealthPremium} className="w-full" size="lg">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Premium
                    </Button>

                    {healthPremium !== null && (
                      <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-6 text-center">
                          <p className="text-sm text-gray-600 mb-2">Estimated Annual Premium</p>
                          <p className="text-4xl font-bold text-red-600">
                            ₹{healthPremium.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                            <Info className="h-3 w-3" />
                            Inclusive of 18% GST
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Life Insurance Calculator */}
              <TabsContent value="life">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Term Life Insurance Premium Calculator
                    </CardTitle>
                    <CardDescription>
                      Estimate term life insurance premium based on age, sum assured, and policy term.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Your Age</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g., 30"
                          value={lifeAge}
                          onChange={(e) => setLifeAge(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Sum Assured (Life Cover)</Label>
                        <Select value={lifeSumAssured} onValueChange={setLifeSumAssured}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5000000">₹50 Lakh</SelectItem>
                            <SelectItem value="10000000">₹1 Crore</SelectItem>
                            <SelectItem value="20000000">₹2 Crore</SelectItem>
                            <SelectItem value="50000000">₹5 Crore</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Policy Term (Years)</Label>
                        <Select value={policyTerm} onValueChange={setPolicyTerm}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 Years</SelectItem>
                            <SelectItem value="15">15 Years</SelectItem>
                            <SelectItem value="20">20 Years</SelectItem>
                            <SelectItem value="25">25 Years</SelectItem>
                            <SelectItem value="30">30 Years</SelectItem>
                            <SelectItem value="35">35 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Tobacco Usage</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox 
                            id="smoker"
                            checked={isSmoker}
                            onCheckedChange={(checked) => setIsSmoker(!!checked)}
                          />
                          <Label htmlFor="smoker" className="text-sm cursor-pointer">
                            Yes, I use tobacco/smoke
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Button onClick={calculateLifePremium} className="w-full" size="lg">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Premium
                    </Button>

                    {lifePremium !== null && (
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-6 text-center">
                          <p className="text-sm text-gray-600 mb-2">Estimated Annual Premium</p>
                          <p className="text-4xl font-bold text-green-600">
                            ₹{lifePremium.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                            <Info className="h-3 w-3" />
                            Inclusive of 18% GST
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Disclaimer */}
            <Card className="mt-8 bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <p className="text-sm text-amber-800">
                  <strong>Disclaimer:</strong> These are estimated premiums for reference only. Actual premiums may vary based on insurer, location, vehicle specifics, medical history, and other factors. Please contact the insurance company for exact quotes.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Track All Your Client Policies in One Place
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
              Join 1000+ insurance agents using Policy Tracker to manage policies, send WhatsApp reminders, and grow their business.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="font-semibold">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-gray-900 text-gray-400">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} Policy Tracker.in. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <Link to="/privacy" className="hover:text-white">Privacy</Link>
              <Link to="/terms-conditions" className="hover:text-white">Terms</Link>
              <Link to="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PremiumCalculatorPage;
