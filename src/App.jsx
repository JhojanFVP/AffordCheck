import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Home,
  Luggage,
  Mail,
  Lock,
  ListChecks,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import "./styles.css";

const purchaseTypes = {
  monthly: {
    label: "Monthly payment",
    title: "Can I afford this monthly payment?",
    newCostLabel: "New monthly payment",
    helper: "Use this for a phone plan, laptop financing, furniture payment, gym membership, or any recurring cost.",
    resultNoun: "payment",
    path: "/monthly-payment-calculator",
    cardTitle: "Monthly Payment Calculator",
    cardText: "Check if a new recurring payment fits your monthly budget.",
    example: "Example: Can I afford a $180 monthly phone or laptop payment?",
    seoTitle: "Monthly Payment Affordability Calculator",
    seoText: "Use this calculator to check whether a new recurring payment fits your monthly income, bills, savings, and emergency fund.",
    advice: [
      "Make sure this payment will not make your monthly leftover money too small.",
      "Recurring costs are harder to remove than one-time purchases, so be conservative.",
      "If the payment is optional, compare it against your emergency fund progress first.",
    ],
  },
  oneTime: {
    label: "One-time purchase",
    title: "Can I afford this one-time purchase?",
    newCostLabel: "Purchase price",
    helper: "Use this for a laptop, phone, furniture, electronics, gifts, or any single purchase.",
    resultNoun: "purchase",
    path: "/one-time-purchase-calculator",
    cardTitle: "One-Time Purchase Calculator",
    cardText: "See if a single purchase would hurt your savings buffer.",
    example: "Example: Can I afford a $900 laptop without draining my savings?",
    seoTitle: "One-Time Purchase Affordability Calculator",
    seoText: "Check whether a single purchase is safe based on your savings, emergency fund, monthly bills, and leftover money.",
    advice: [
      "A one-time purchase is safer when it does not drain your emergency savings.",
      "If the item is not urgent, saving for it first can protect your monthly budget.",
      "Compare the purchase against upcoming bills before buying.",
    ],
  },
  rent: {
    label: "Rent / moving out",
    title: "Can I afford this rent?",
    newCostLabel: "New rent amount",
    helper: "Use this to check whether rent or moving out would leave enough money after bills.",
    resultNoun: "rent",
    path: "/rent-affordability-calculator",
    cardTitle: "Rent Affordability Calculator",
    cardText: "Estimate whether rent or moving out is realistic.",
    example: "Example: Can I afford $1,400 rent and still cover food, utilities, and transportation?",
    seoTitle: "Rent Affordability Calculator",
    seoText: "Estimate whether a rent payment or moving out plan leaves enough room for utilities, food, transportation, savings, and other bills.",
    advice: [
      "Rent is only one part of housing cost. Remember utilities, deposits, furniture, parking, and moving costs.",
      "A rent amount can look okay by itself but become risky once transportation and food are included.",
      "Before moving, try living one month as if you already had the new rent payment.",
    ],
  },
  car: {
    label: "Car payment",
    title: "Can I afford this car payment?",
    newCostLabel: "Car payment",
    helper: "Use this for a monthly car payment. Include insurance/gas under transportation if you know it.",
    resultNoun: "car payment",
    path: "/car-payment-calculator",
    cardTitle: "Car Payment Calculator",
    cardText: "Check if a car payment is safe after bills and savings.",
    example: "Example: Can I afford a $350 car payment after insurance, gas, and repairs?",
    seoTitle: "Car Payment Affordability Calculator",
    seoText: "Check whether a car payment fits your budget after rent, insurance, gas, repairs, bills, savings, and debt payments.",
    advice: [
      "A car payment is not the full cost. Add insurance, gas, maintenance, registration, and repairs.",
      "If your transportation category is already high, a new car payment can become risky fast.",
      "Used cars can still have repair costs, so leave a monthly buffer.",
    ],
  },
  bnpl: {
    label: "Buy Now, Pay Later",
    title: "Can I afford this BNPL plan?",
    newCostLabel: "BNPL monthly payment",
    helper: "Use this for Klarna, Afterpay, Affirm, PayPal Pay Later, or similar installment plans.",
    resultNoun: "BNPL payment",
    path: "/bnpl-calculator",
    cardTitle: "BNPL Calculator",
    cardText: "Avoid stacking too many small payment plans.",
    example: "Example: Can I afford a $75 BNPL payment without stacking too many plans?",
    seoTitle: "Buy Now, Pay Later Calculator",
    seoText: "Check whether a BNPL installment plan is safe based on your income, current debt, bills, and emergency savings.",
    advice: [
      "BNPL plans feel small individually, but several plans can stack into a serious monthly bill.",
      "Only use this if you can afford the full purchase without relying on future money you are unsure about.",
      "Be careful when BNPL overlaps with debt payments or low emergency savings.",
    ],
  },
  vacation: {
    label: "Vacation",
    title: "Can I afford this vacation?",
    newCostLabel: "Vacation cost",
    helper: "Use this to check if a trip cost is safe based on your savings and monthly budget.",
    resultNoun: "vacation",
    path: "/vacation-affordability-calculator",
    cardTitle: "Vacation Calculator",
    cardText: "Plan a trip without wiping out your safety cushion.",
    example: "Example: Can I afford a $1,200 trip and still keep emergency savings?",
    seoTitle: "Vacation Affordability Calculator",
    seoText: "Check whether a trip cost is safe after considering your savings, emergency fund, monthly bills, and leftover money.",
    advice: [
      "A vacation is safer when the full trip is paid without touching emergency savings.",
      "Remember food, local transportation, tips, baggage fees, and missed income if applicable.",
      "A cheaper trip can still be enjoyable if it avoids creating stress after you return.",
    ],
  },
};

const routeToType = Object.fromEntries(
  Object.entries(purchaseTypes).map(([key, item]) => [item.path, key])
);

const defaults = {
  income: 2800,
  rent: 950,
  utilities: 180,
  groceries: 350,
  transportation: 250,
  debt: 120,
  subscriptions: 45,
  otherBills: 150,
  savings: 800,
  emergencyGoal: 3000,
  newCost: 180,
};

function getInitialType() {
  const path = window.location.pathname;
  return routeToType[path] || "monthly";
}

function getPageInfo(typeKey) {
  const type = purchaseTypes[typeKey] || purchaseTypes.monthly;
  const isHome = window.location.pathname === "/";
  if (isHome) {
    return {
      isHome: true,
      title: "Know before you buy.",
      subtitle:
        "Check whether a payment, purchase, rent, car, vacation, or buy now pay later plan fits your real budget before it becomes stress later.",
      documentTitle: "AffordCheck - Know Before You Buy",
    };
  }

  return {
    isHome: false,
    title: type.seoTitle,
    subtitle: type.seoText,
    documentTitle: `${type.seoTitle} | AffordCheck`,
  };
}

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function percent(value) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

function calculateAffordability(form) {
  const type = purchaseTypes[form.purchaseType] || purchaseTypes.monthly;

  const income = Number(form.income || 0);
  const rent = Number(form.rent || 0);
  const utilities = Number(form.utilities || 0);
  const groceries = Number(form.groceries || 0);
  const transportation = Number(form.transportation || 0);
  const debt = Number(form.debt || 0);
  const subscriptions = Number(form.subscriptions || 0);
  const otherBills = Number(form.otherBills || 0);
  const savings = Number(form.savings || 0);
  const emergencyGoal = Number(form.emergencyGoal || 0);
  const newCost = Number(form.newCost || 0);

  const isOneTime = ["oneTime", "vacation"].includes(form.purchaseType);
  const requiredBills =
    rent + utilities + groceries + transportation + debt + subscriptions + otherBills;

  const leftoverBefore = income - requiredBills;
  const monthlyImpact = isOneTime ? 0 : newCost;
  const leftoverAfter = leftoverBefore - monthlyImpact;
  const savingsAfterPurchase = isOneTime ? savings - newCost : savings;

  const paymentToIncome = income > 0 ? (monthlyImpact / income) * 100 : 0;
  const purchaseToSavings = savings > 0 ? (newCost / savings) * 100 : 999;
  const billsToIncome = income > 0 ? (requiredBills / income) * 100 : 0;
  const emergencyProgress = emergencyGoal > 0 ? (savingsAfterPurchase / emergencyGoal) * 100 : 100;

  let score = 100;

  if (income <= 0) score -= 60;

  if (isOneTime) {
    if (savingsAfterPurchase < 0) score -= 45;
    else if (savingsAfterPurchase < emergencyGoal * 0.25) score -= 28;
    else if (savingsAfterPurchase < emergencyGoal * 0.5) score -= 18;

    if (purchaseToSavings > 80) score -= 25;
    else if (purchaseToSavings > 50) score -= 15;
    else if (purchaseToSavings > 30) score -= 8;

    if (leftoverBefore < income * 0.05) score -= 20;
  } else {
    if (leftoverAfter < 0) score -= 45;
    else if (leftoverAfter < income * 0.05) score -= 30;
    else if (leftoverAfter < income * 0.1) score -= 18;

    if (paymentToIncome > 25) score -= 30;
    else if (paymentToIncome > 15) score -= 20;
    else if (paymentToIncome > 10) score -= 10;
  }

  if (billsToIncome > 85) score -= 25;
  else if (billsToIncome > 75) score -= 15;
  else if (billsToIncome > 65) score -= 8;

  if (emergencyProgress < 25) score -= 20;
  else if (emergencyProgress < 50) score -= 12;
  else if (emergencyProgress < 75) score -= 6;

  if (form.purchaseType === "rent" && income > 0 && newCost / income > 0.4) score -= 15;
  if (form.purchaseType === "car" && income > 0 && newCost / income > 0.15) score -= 10;
  if (form.purchaseType === "bnpl" && debt > income * 0.1) score -= 8;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let status = "Safe";
  let statusClass = "safe";
  let icon = "check";
  let summary = `This ${type.resultNoun} looks manageable based on the numbers you entered.`;

  if (score < 45 || (!isOneTime && leftoverAfter < 0) || (isOneTime && savingsAfterPurchase < 0)) {
    status = "Not Recommended";
    statusClass = "danger";
    icon = "warning";
    summary = `This ${type.resultNoun} could put your budget under pressure. Waiting, saving more, or choosing a cheaper option would be safer.`;
  } else if (score < 75) {
    status = "Risky";
    statusClass = "risky";
    icon = "trend";
    summary = `This ${type.resultNoun} may be possible, but your leftover money or emergency savings may be tight.`;
  }

  const suggestedMaxPayment = Math.max(0, Math.floor(Math.min(leftoverBefore * 0.35, income * 0.1)));
  const suggestedMaxOneTime = Math.max(0, Math.floor(Math.max(0, savings - emergencyGoal * 0.5)));
  const recommendedMax = isOneTime ? suggestedMaxOneTime : suggestedMaxPayment;

  const saveFirstAmount = isOneTime
    ? Math.max(0, Math.min(newCost, emergencyGoal * 0.75 - savingsAfterPurchase))
    : emergencyGoal > 0
      ? Math.max(0, Math.min(emergencyGoal - savings, newCost * 3))
      : 0;

  const monthsToSaveFirst =
    leftoverBefore > 0 && saveFirstAmount > 0 ? Math.ceil(saveFirstAmount / leftoverBefore) : 0;

  const warnings = [];
  if (!isOneTime && leftoverAfter < 0) warnings.push("This payment is higher than your available monthly leftover money.");
  if (isOneTime && savingsAfterPurchase < 0) warnings.push("This purchase is higher than your current savings.");
  if (!isOneTime && paymentToIncome > 15) warnings.push("The new payment takes a large share of your monthly income.");
  if (isOneTime && purchaseToSavings > 50) warnings.push("This purchase would use more than half of your current savings.");
  if (emergencyProgress < 50) warnings.push("Your emergency fund would be below 50% of your target.");
  if (billsToIncome > 75) warnings.push("Most of your income is already committed to bills and debt.");
  if (form.purchaseType === "bnpl") warnings.push("BNPL plans can stack up quickly if you open multiple installment payments.");

  const positives = [];
  if (!isOneTime && leftoverAfter > income * 0.1) positives.push("You still have a monthly buffer after this payment.");
  if (!isOneTime && paymentToIncome <= 10) positives.push("The new payment is a relatively small share of income.");
  if (isOneTime && savingsAfterPurchase >= emergencyGoal * 0.75) positives.push("You would still keep most of your emergency fund after this purchase.");
  if (emergencyProgress >= 75) positives.push("Your emergency fund is close to or above your target.");

  return {
    type,
    isOneTime,
    income,
    requiredBills,
    leftoverBefore,
    leftoverAfter,
    savingsAfterPurchase,
    paymentToIncome,
    purchaseToSavings,
    billsToIncome,
    emergencyProgress,
    score,
    status,
    statusClass,
    icon,
    summary,
    recommendedMax,
    saveFirstAmount,
    monthsToSaveFirst,
    warnings,
    positives,
  };
}

export default function App() {
  const [form, setForm] = useState({ ...defaults, purchaseType: getInitialType() });
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const result = useMemo(() => calculateAffordability(form), [form]);
  const type = purchaseTypes[form.purchaseType] || purchaseTypes.monthly;
  const pageInfo = getPageInfo(form.purchaseType);

  useEffect(() => {
    document.title = pageInfo.documentTitle;
  }, [pageInfo.documentTitle]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetExample() {
    setForm({ ...defaults, purchaseType: form.purchaseType });
  }

  function chooseCalculator(key) {
    setForm((prev) => ({ ...prev, purchaseType: key }));
    window.history.pushState({}, "", purchaseTypes[key].path);
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  }

  function copyResult() {
    const text = `AffordCheck result: ${result.status} (${result.score}/100)
Type: ${type.label}
Leftover before: ${money(result.leftoverBefore)}
${result.isOneTime ? `Savings after purchase: ${money(result.savingsAfterPurchase)}` : `Leftover after payment: ${money(result.leftoverAfter)}`}
Recommended max: ${money(result.recommendedMax)}
Summary: ${result.summary}`;
    navigator.clipboard.writeText(text);
    alert("Result copied.");
  }

  async function submitEmail(event) {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setEmailMessage("Enter a valid email first.");
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      const savedEmails = JSON.parse(localStorage.getItem("affordcheck_demo_signups") || "[]");
      localStorage.setItem(
        "affordcheck_demo_signups",
        JSON.stringify([
          ...savedEmails,
          {
            email: cleanEmail,
            source: window.location.pathname,
            created_at: new Date().toISOString(),
          },
        ])
      );
      setEmailMessage("Saved locally for testing. Connect Supabase to collect real signups online.");
      setEmail("");
      return;
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/signups`, {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          email: cleanEmail,
          source: window.location.pathname,
        }),
      });

      if (!response.ok) {
        throw new Error("Signup request failed.");
      }

      setEmailMessage("You’re on the list. I’ll send the checklist when it’s ready.");
      setEmail("");
    } catch (error) {
      setEmailMessage("Signup failed. Check your Supabase table, keys, and RLS insert policy.");
    }
  }

  const StatusIcon =
    result.icon === "warning" ? AlertTriangle : result.icon === "trend" ? TrendingUp : CheckCircle2;

  return (
    <>
      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-mark">A</span>
          <span>AffordCheck</span>
        </a>
        <nav>
          <a href="#calculator">Calculator</a>
          <a href="#calculators">Tools</a>
          <a href="#why">Why use it</a>
          <a href="#trust">Trust</a>
          <a href="#join">Updates</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="badge">{pageInfo.isHome ? "Free affordability calculators" : "Free calculator"}</div>
          <h1>{pageInfo.title}</h1>
          <p>{pageInfo.subtitle}</p>
          <div className="example-strip">
            <span>$350 car payment?</span>
            <span>$1,400 rent?</span>
            <span>$900 laptop?</span>
            <span>$1,200 vacation?</span>
          </div>
          <div className="hero-actions">
            <a className="hero-button primary-link" href="#calculator">Use calculator</a>
            <a className="hero-button secondary-link" href="#calculators">View tools</a>
          </div>
        </section>

        <section className="layout" id="calculator">
          <form className="card input-card">
            <div className="card-header">
              <WalletCards size={24} />
              <div>
                <h2>{type.title}</h2>
                <p>Enter monthly after-tax income, regular expenses, savings, and the new cost.</p>
              </div>
            </div>

            <label className="full">
              <span>What are you checking?</span>
              <select
                value={form.purchaseType}
                onChange={(event) => chooseCalculator(event.target.value)}
              >
                {Object.entries(purchaseTypes).map(([key, item]) => (
                  <option key={key} value={key}>{item.label}</option>
                ))}
              </select>
              <small>{type.helper}</small>
            </label>

            <div className="grid">
              <NumberInput label="Monthly take-home income" name="income" value={form.income} onChange={updateField} />
              <NumberInput label="Current rent / mortgage" name="rent" value={form.rent} onChange={updateField} />
              <NumberInput label="Utilities" name="utilities" value={form.utilities} onChange={updateField} />
              <NumberInput label="Groceries" name="groceries" value={form.groceries} onChange={updateField} />
              <NumberInput label="Transportation" name="transportation" value={form.transportation} onChange={updateField} />
              <NumberInput label="Debt payments" name="debt" value={form.debt} onChange={updateField} />
              <NumberInput label="Subscriptions" name="subscriptions" value={form.subscriptions} onChange={updateField} />
              <NumberInput label="Other bills" name="otherBills" value={form.otherBills} onChange={updateField} />
              <NumberInput label="Current savings" name="savings" value={form.savings} onChange={updateField} />
              <NumberInput label="Emergency fund goal" name="emergencyGoal" value={form.emergencyGoal} onChange={updateField} />
              <NumberInput label={type.newCostLabel} name="newCost" value={form.newCost} onChange={updateField} highlight />
            </div>

            <div className="button-row">
              <button type="button" className="secondary" onClick={resetExample}>
                Reset example
              </button>
              <button type="button" className="primary" onClick={copyResult}>
                Copy result
              </button>
            </div>
          </form>

          <section className={`card result-card ${result.statusClass}`}>
            <div className="score-row">
              <div>
                <p className="eyebrow">Affordability result</p>
                <h2>{result.status}</h2>
              </div>
              <div className="score-circle">
                <StatusIcon size={32} />
                <strong>{result.score}</strong>
                <span>/100</span>
              </div>
            </div>

            <p className="summary">{result.summary}</p>

            <div className="metrics">
              <Metric label="Leftover before" value={money(result.leftoverBefore)} />
              <Metric
                label={result.isOneTime ? "Savings after purchase" : "Leftover after"}
                value={money(result.isOneTime ? result.savingsAfterPurchase : result.leftoverAfter)}
              />
              <Metric
                label={result.isOneTime ? "Cost as % of savings" : "Payment as % of income"}
                value={percent(result.isOneTime ? result.purchaseToSavings : result.paymentToIncome)}
              />
              <Metric label="Emergency fund progress" value={percent(result.emergencyProgress)} />
            </div>

            <div className="recommendation">
              <h3>{result.isOneTime ? "Recommended max purchase" : "Recommended max payment"}</h3>
              <p className="big">{money(result.recommendedMax)}</p>
              <p>
                This estimate keeps the cost conservative based on your income,
                leftover money, savings, and emergency fund.
              </p>
            </div>

            {result.saveFirstAmount > 0 && (
              <div className="recommendation">
                <h3>Safer move</h3>
                <p>
                  Consider saving about <strong>{money(result.saveFirstAmount)}</strong> first.
                  At your current leftover amount, that could take about{" "}
                  <strong>{result.monthsToSaveFirst || "more than a few"} month(s)</strong>.
                </p>
              </div>
            )}

            <div className="notes">
              <div>
                <h3>Advice for {type.label.toLowerCase()}</h3>
                <ul>
                  {type.advice.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {result.warnings.length > 0 && (
                <div>
                  <h3>Watch out</h3>
                  <ul>
                    {result.warnings.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.positives.length > 0 && (
                <div>
                  <h3>Good signs</h3>
                  <ul>
                    {result.positives.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <p className="disclaimer">
              This is an educational calculator, not financial advice. Use it as a starting point
              and double-check your own budget before making major decisions.
            </p>
          </section>
        </section>

        <section className="tools-section" id="calculators">
          <div className="section-heading">
            <p className="eyebrow">More calculators</p>
            <h2>Try a specific money decision.</h2>
            <p>Each page has its own shareable URL, which is better for testing and future search traffic.</p>
          </div>

          <div className="tool-grid">
            {Object.entries(purchaseTypes).map(([key, item]) => (
              <ToolCard
                key={key}
                icon={getIcon(key)}
                item={item}
                onClick={() => chooseCalculator(key)}
              />
            ))}
          </div>
        </section>

        <section className="why-section" id="why">
          <div className="section-heading">
            <p className="eyebrow">Why use AffordCheck?</p>
            <h2>A quick reality check before the checkout page.</h2>
          </div>
          <div className="why-grid">
            <div className="why-card">
              <ShieldCheck />
              <h3>See the real leftover money</h3>
              <p>AffordCheck shows what remains after regular bills and the new cost, not just whether you technically have cash today.</p>
            </div>
            <div className="why-card">
              <AlertTriangle />
              <h3>Catch risky choices early</h3>
              <p>It flags weak emergency savings, high payment pressure, and purchases that use too much of your savings.</p>
            </div>
            <div className="why-card">
              <TrendingUp />
              <h3>Compare safer alternatives</h3>
              <p>The recommended max cost gives you a starting point for choosing a cheaper option or saving first.</p>
            </div>
          </div>
        </section>

        <section className="trust-section" id="trust">
          <div className="section-heading">
            <p className="eyebrow">Trust and transparency</p>
            <h2>What the score actually means.</h2>
            <p>
              AffordCheck is meant to be a quick budgeting reality check, not a replacement for professional financial advice.
            </p>
          </div>

          <div className="trust-grid">
            <div className="trust-card">
              <ListChecks />
              <h3>Score factors</h3>
              <p>
                The score looks at leftover money after bills, the new cost, emergency fund progress,
                debt pressure, and whether the cost is one-time or recurring.
              </p>
            </div>
            <div className="trust-card">
              <ShieldCheck />
              <h3>Conservative by design</h3>
              <p>
                The recommendation is intentionally cautious. A lower max payment does not mean you
                cannot buy something. It means buying less or saving first may reduce stress.
              </p>
            </div>
            <div className="trust-card">
              <Lock />
              <h3>Privacy-first MVP</h3>
              <p>
                The calculator runs in your browser. Your numbers are not sent anywhere unless you
                choose to submit your email for updates.
              </p>
            </div>
          </div>

          <div className="formula-card card">
            <h3>How results are judged</h3>
            <div className="formula-grid">
              <div>
                <strong>Safe</strong>
                <p>Cost appears manageable, leftover money remains positive, and savings are not heavily damaged.</p>
              </div>
              <div>
                <strong>Risky</strong>
                <p>The cost may fit, but leftover money, debt, or emergency savings are getting tight.</p>
              </div>
              <div>
                <strong>Not Recommended</strong>
                <p>The cost may create a negative buffer, drain savings, or take too much of monthly income.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="info card" id="how">
          <h2>How AffordCheck works</h2>
          <p>
            AffordCheck compares your new cost against your monthly leftover money,
            income, current savings, emergency fund goal, and debt pressure. A safe
            result does not mean you should buy it automatically. It means the cost
            appears more manageable based on the numbers entered.
          </p>
          <div className="info-grid">
            <div>
              <h3>Safe</h3>
              <p>You still have room after the cost, and your emergency savings are not heavily damaged.</p>
            </div>
            <div>
              <h3>Risky</h3>
              <p>You may be able to afford it, but the cost could make your budget tight.</p>
            </div>
            <div>
              <h3>Not Recommended</h3>
              <p>The cost may be too high compared with your income, savings, or monthly bills.</p>
            </div>
          </div>
        </section>

        <section className="email-card card" id="join">
          <div>
            <Mail size={30} />
            <h2>Want a personal budget checklist?</h2>
            <p>
              Get a simple checklist for reviewing a purchase before you commit.
              This form is ready to connect to Supabase so real signups can be saved online.
            </p>
          </div>
          <form onSubmit={submitEmail}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button className="primary" type="submit">Notify me</button>
            {emailMessage && <small>{emailMessage}</small>}
          </form>
        </section>

        <section className="bottom-cta">
          <h2>Before you finance it, rent it, book it, or buy it — check it.</h2>
          <a className="hero-button primary-link" href="#calculator">Run the calculator</a>
        </section>

        <footer>
          <strong>AffordCheck</strong>
          <span>Educational calculator only. Not financial advice.</span>
        </footer>
      </main>
    </>
  );
}

function getIcon(key) {
  const icons = {
    monthly: <WalletCards />,
    oneTime: <ShoppingBag />,
    rent: <Home />,
    car: <Car />,
    bnpl: <TrendingUp />,
    vacation: <Luggage />,
  };
  return icons[key] || <WalletCards />;
}

function NumberInput({ label, name, value, onChange, highlight = false }) {
  return (
    <label className={highlight ? "highlight" : ""}>
      <span>{label}</span>
      <div className="money-input">
        <span>$</span>
        <input
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
        />
      </div>
    </label>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ToolCard({ icon, item, onClick }) {
  return (
    <button className="tool-card" type="button" onClick={onClick}>
      <div className="tool-icon">{icon}</div>
      <h3>{item.cardTitle}</h3>
      <p>{item.cardText}</p>
      <small>{item.example}</small>
      <span className="card-url">{item.path}</span>
    </button>
  );
}
