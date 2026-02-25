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
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";

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

      <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
        <Navigation />

        {/* Hero Section */}
        <section className="py-16 md:py-24 relative overflow-hidden bg-white border-b border-slate-200">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <Badge className="mb-6 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-sm px-4 py-1.5 rounded-full text-sm font-medium">
              <Calculator className="h-4 w-4 mr-2" />
              Free Tool for Agents
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              Insurance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Premium Calculator</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Quickly estimate insurance premiums for your clients. Calculate motor, health, and life insurance premiums with our free tool.
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <Tabs defaultValue="motor" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 shadow-sm h-auto">
                <TabsTrigger value="motor" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all py-3">
                  <Car className="h-5 w-5" />
                  <span className="hidden sm:inline font-semibold">Motor</span>
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all py-3">
                  <Heart className="h-5 w-5" />
                  <span className="hidden sm:inline font-semibold">Health</span>
                </TabsTrigger>
                <TabsTrigger value="life" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all py-3">
                  <Shield className="h-5 w-5" />
                  <span className="hidden sm:inline font-semibold">Life</span>
                </TabsTrigger>
              </TabsList>

              {/* Motor Insurance Calculator */}
              <TabsContent value="motor" className="mt-0">
                <Card className="border-slate-200 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 pt-8 px-8">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                      <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl shadow-sm border border-indigo-200/50">
                        <Car className="h-6 w-6" />
                      </div>
                      Motor Insurance Premium
                    </CardTitle>
                    <CardDescription className="text-base text-slate-500 mt-2">
                      Estimate comprehensive motor insurance premium for cars, bikes, and commercial vehicles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Vehicle Type</Label>
                        <Select value={vehicleType} onValueChange={setVehicleType}>
                          <SelectTrigger className="h-12 border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="car">Private Car</SelectItem>
                            <SelectItem value="bike">Two Wheeler</SelectItem>
                            <SelectItem value="commercial">Commercial Vehicle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Vehicle Age (Years)</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 3"
                          value={vehicleAge}
                          onChange={(e) => setVehicleAge(e.target.value)}
                          className="h-12 border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">IDV (Insured Declared Value)</Label>
                        <div className="relative">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="number"
                            placeholder="e.g., 500000"
                            className="pl-11 h-12 border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                            value={idv}
                            onChange={(e) => setIdv(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">NCB (No Claim Bonus)</Label>
                        <Select value={ncbPercent} onValueChange={setNcbPercent}>
                          <SelectTrigger className="h-12 border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl">
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

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <Label className="text-sm font-semibold text-slate-700">Recommended Add-ons</Label>
                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center space-x-3 bg-white p-3 pr-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm">
                          <Checkbox
                            id="zeroDepreciation"
                            checked={hasZeroDepreciation}
                            className="h-5 w-5 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white border-slate-300"
                            onCheckedChange={(checked) => setHasZeroDepreciation(!!checked)}
                          />
                          <Label htmlFor="zeroDepreciation" className="text-sm font-medium text-slate-700 cursor-pointer">Zero Depreciation</Label>
                        </div>
                        <div className="flex items-center space-x-3 bg-white p-3 pr-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm">
                          <Checkbox
                            id="engineProtect"
                            checked={hasEngineProtect}
                            className="h-5 w-5 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white border-slate-300"
                            onCheckedChange={(checked) => setHasEngineProtect(!!checked)}
                          />
                          <Label htmlFor="engineProtect" className="text-sm font-medium text-slate-700 cursor-pointer">Engine Protection</Label>
                        </div>
                      </div>
                    </div>

                    <Button onClick={calculateMotorPremium} className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 rounded-xl" size="lg">
                      <Calculator className="h-5 w-5 mr-2" />
                      Calculate Motor Premium
                    </Button>

                    {motorPremium !== null && (
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-8 text-center shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/40 blur-[30px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <p className="text-sm font-semibold text-indigo-800/70 mb-2 tracking-wide uppercase">Estimated Annual Premium</p>
                        <p className="text-5xl font-extrabold text-indigo-900 tracking-tight">
                          ₹{motorPremium.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs font-medium text-indigo-600 mt-3 flex items-center justify-center gap-1.5">
                          <Info className="h-3.5 w-3.5" />
                          Inclusive of 18% GST (Calculated for illustration)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Health Insurance Calculator */}
              <TabsContent value="health" className="mt-0">
                <Card className="border-slate-200 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 pt-8 px-8">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                      <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shadow-sm border border-rose-200/50">
                        <Heart className="h-6 w-6" />
                      </div>
                      Health Insurance Premium
                    </CardTitle>
                    <CardDescription className="text-base text-slate-500 mt-2">
                      Estimate health insurance premium for individuals and family floater plans.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Age of Eldest Member</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 35"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-12 border-slate-200 bg-white focus:ring-rose-500 focus:border-rose-500 rounded-xl"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Sum Insured</Label>
                        <Select value={sumInsured} onValueChange={setSumInsured}>
                          <SelectTrigger className="h-12 border-slate-200 bg-white focus:ring-rose-500 focus:border-rose-500 rounded-xl">
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

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Number of Family Members</Label>
                        <Select value={familyMembers} onValueChange={setFamilyMembers}>
                          <SelectTrigger className="h-12 border-slate-200 bg-white focus:ring-rose-500 focus:border-rose-500 rounded-xl">
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

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Pre-existing Conditions</Label>
                        <div className="flex items-center space-x-3 mt-1 bg-white p-3 pr-5 rounded-xl border border-slate-200 hover:border-rose-300 transition-colors shadow-sm w-fit">
                          <Checkbox
                            id="preExisting"
                            checked={hasPreExisting}
                            className="h-5 w-5 data-[state=checked]:bg-rose-600 data-[state=checked]:text-white border-slate-300"
                            onCheckedChange={(checked) => setHasPreExisting(!!checked)}
                          />
                          <Label htmlFor="preExisting" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Yes, has pre-existing conditions
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Button onClick={calculateHealthPremium} className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 rounded-xl" size="lg">
                      <Calculator className="h-5 w-5 mr-2" />
                      Calculate Health Premium
                    </Button>

                    {healthPremium !== null && (
                      <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-8 text-center shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/40 blur-[30px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <p className="text-sm font-semibold text-rose-800/70 mb-2 tracking-wide uppercase">Estimated Annual Premium</p>
                        <p className="text-5xl font-extrabold text-rose-900 tracking-tight">
                          ₹{healthPremium.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs font-medium text-rose-600 mt-3 flex items-center justify-center gap-1.5">
                          <Info className="h-3.5 w-3.5" />
                          Inclusive of 18% GST (Calculated for illustration)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Life Insurance Calculator */}
              <TabsContent value="life" className="mt-0">
                <Card className="border-slate-200 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 pt-8 px-8">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                      <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm border border-emerald-200/50">
                        <Shield className="h-6 w-6" />
                      </div>
                      Term Life Insurance Premium
                    </CardTitle>
                    <CardDescription className="text-base text-slate-500 mt-2">
                      Estimate term life insurance premium based on age, sum assured, and policy term.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Your Age</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 30"
                          value={lifeAge}
                          onChange={(e) => setLifeAge(e.target.value)}
                          className="h-12 border-slate-200 bg-white focus:ring-emerald-500 focus:border-emerald-500 rounded-xl"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Sum Assured (Life Cover)</Label>
                        <Select value={lifeSumAssured} onValueChange={setLifeSumAssured}>
                          <SelectTrigger className="h-12 border-slate-200 bg-white focus:ring-emerald-500 focus:border-emerald-500 rounded-xl">
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

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Policy Term (Years)</Label>
                        <Select value={policyTerm} onValueChange={setPolicyTerm}>
                          <SelectTrigger className="h-12 border-slate-200 bg-white focus:ring-emerald-500 focus:border-emerald-500 rounded-xl">
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

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Tobacco Usage</Label>
                        <div className="flex items-center space-x-3 mt-1 bg-white p-3 pr-5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors shadow-sm w-fit">
                          <Checkbox
                            id="smoker"
                            checked={isSmoker}
                            className="h-5 w-5 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white border-slate-300"
                            onCheckedChange={(checked) => setIsSmoker(!!checked)}
                          />
                          <Label htmlFor="smoker" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Yes, I use tobacco/smoke
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Button onClick={calculateLifePremium} className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 rounded-xl" size="lg">
                      <Calculator className="h-5 w-5 mr-2" />
                      Calculate Life Premium
                    </Button>

                    {lifePremium !== null && (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-8 text-center shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/40 blur-[30px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <p className="text-sm font-semibold text-emerald-800/70 mb-2 tracking-wide uppercase">Estimated Annual Premium</p>
                        <p className="text-5xl font-extrabold text-emerald-900 tracking-tight">
                          ₹{lifePremium.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs font-medium text-emerald-600 mt-3 flex items-center justify-center gap-1.5">
                          <Info className="h-3.5 w-3.5" />
                          Inclusive of 18% GST (Calculated for illustration)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Disclaimer */}
            <div className="mt-8 bg-amber-50 border border-amber-200/70 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-amber-800/90 leading-relaxed font-medium">
                <strong className="text-amber-900 font-bold">Disclaimer:</strong> These are estimated premiums for reference only. Actual premiums may vary based on insurer, location, vehicle specifics, medical history, and other factors. Please contact the insurance company for exact quotes.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] opacity-70"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
              Track All Your Client Policies in One Place
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Join thousands of insurance agents using PolicyTracker.in to manage policies, send WhatsApp reminders, and grow their business efficiently.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold h-14 px-8 text-lg border-0 shadow-lg shadow-indigo-900/50">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PremiumCalculatorPage;
