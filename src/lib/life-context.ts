import type { NormalizedRelease } from "@/lib/release-hub";

export const lifeStages = ["Everyone", "Student", "Starting work", "Renter", "New family", "Homeowner"] as const;
export type LifeStage = typeof lifeStages[number];

export function lifeContext(release: NormalizedRelease) {
  const text = `${release.title} ${release.releaseType}`.toLowerCase();
  if (/gross domestic product|\bgdp\b/.test(text)) return {
    title: "What this means for economic opportunity",
    impact: "GDP measures production across the economy. Growth can support jobs and public revenue, but it does not tell you whether your pay is rising faster than your bills. Look at GDP per person, wages and household costs together.",
    different: "A national total can hide differences across industries, provinces and age groups. Total GDP can rise while GDP per person falls.",
    limitation: "Check whether the figure is in real or current dollars and whether a change is monthly, quarterly or annual. GDP alone does not prove a household is better off.",
    action: "Explore growth and household context", href: "/canada", stages: ["Everyone", "Starting work"] as LifeStage[],
  };
  if (/immigra|refugee|population|ircc/.test(text)) return {
    title: "What this means for a changing population",
    impact: "Population and arrival data help explain changing demand for homes, work, education and services. Compare arrivals with the capacity and outcomes of those systems; a count alone does not explain a local shortage.",
    different: "Permanent residents, temporary residents and people claiming asylum are different groups. Admissions are a flow during a period, not the number of people currently living here.",
    limitation: "Raw provincial counts are not adjusted for population and do not establish what caused rents, wages or service pressures to change.",
    action: "Explore population and immigration", href: "/population", stages: ["Everyone", "Renter", "Starting work"] as LifeStage[],
  };
  if (/energy|electric|oil|natural gas/.test(text)) return {
    title: "What this means for energy and the future",
    impact: "Energy production, electricity and prices connect to utility bills, regional jobs and the transition to lower emissions. Production and export totals are not your household energy price.",
    different: "Energy-producing regions, commuters and households using different heating systems can experience different effects.",
    limitation: "Check the fuel, units and observation period. One energy measure does not establish household costs or environmental outcomes.",
    action: "Explore energy evidence", href: "/energy", stages: ["Everyone", "Homeowner"] as LifeStage[],
  };
  if (/international.*trade|merchandise.*trade|export|import/.test(text)) return {
    title: "What this means for industries and jobs",
    impact: "Trade data show how Canadian industries connect to demand abroad and imported supplies. Changes can reach jobs, business investment and prices, with different effects by industry and region.",
    different: "Export-oriented workers and businesses using imported inputs can experience the same change differently.",
    limitation: "A trade total may reflect prices as well as quantities. It is not proof that every region or household benefits.",
    action: "Explore trade and industries", href: "/trade", stages: ["Everyone", "Starting work"] as LifeStage[],
  };
  if (/labour|employment|wage/.test(text)) return {
    title: "What this means for finding work",
    impact: "Employment, participation and unemployment together help explain the competition for jobs. A national improvement may not reach your age group or local industry.",
    different: "Students and people entering work can face different conditions from established workers. Compare the 15–24 series with the broader labour market.",
    limitation: "An unemployment rate describes people actively looking for work. It is not your personal probability of getting hired.",
    action: "Explore youth jobs and wages", href: "/work", stages: ["Student", "Starting work"] as LifeStage[],
  };
  if (/rental|housing|home|construction/.test(text)) return {
    title: "What this means for your next home",
    impact: "Rent, vacancy and completed supply affect what you can find and how much room remains in your monthly budget. Construction starts are a pipeline, not homes ready to move into.",
    different: "Someone signing a new lease may pay more than a sitting tenant. Owners, renters and shared households experience housing costs differently.",
    limitation: "Survey averages cover a defined rental universe. They are not a quote for an available apartment or a forecast of your next lease.",
    action: "Try the move-out budget", href: "/my-life", stages: ["Renter", "New family"] as LifeStage[],
  };
  if (/consumer price|inflation/.test(text)) return {
    title: "What this means for your spending power",
    impact: "Inflation measures how quickly prices change. Slower inflation can still mean a more expensive grocery basket. Compare prices with your pay and spending mix.",
    different: "Food-heavy budgets and rent-heavy budgets can experience different pressure from the headline average.",
    limitation: "CPI is a representative basket. It does not measure every household's personal bill, and falling inflation does not necessarily mean falling prices.",
    action: "Explore everyday costs", href: "/money", stages: ["Everyone", "Renter", "New family"] as LifeStage[],
  };
  if (/rate|valet|monetary/.test(text)) return {
    title: "What this means for borrowing and saving",
    impact: "Changes in borrowing conditions can reach loans, mortgage renewals and savings returns at different times. Your contract and lender determine the actual rate you receive.",
    different: "Borrowers and savers can experience opposite effects. Fixed-rate and variable-rate borrowers do not reset on the same timetable.",
    limitation: "A policy rate is not a retail loan rate. This release alone does not establish what caused housing or spending to change.",
    action: "Build your monthly budget", href: "/my-life", stages: ["Homeowner", "New family"] as LifeStage[],
  };
  if (/fiscal|budget|finance|debt/.test(text)) return {
    title: "What this means for public services",
    impact: "Revenue, spending and debt charges show the government's financial position. Follow funded programs and service outcomes to see how those choices reach daily life.",
    different: "A national spending total does not say which households qualify for a program or whether local services improved.",
    limitation: "Announcements, approved budgets, actual spending and measured outcomes are different stages. They should not be treated as interchangeable.",
    action: "Follow government decisions", href: "/government", stages: ["Everyone", "New family"] as LifeStage[],
  };
  return {
    title: "How this connects to everyday life",
    impact: "This evidence provides context for jobs, prices, services or future opportunity. Look at the affected industries and regions before drawing a household conclusion.",
    different: "National averages can hide differences by age, income, household and place. A higher total can also reflect a larger population.",
    limitation: "A reported change is evidence of what happened, not proof of a single cause or a prediction of your own outcome.",
    action: "Compare the evidence", href: "/compare", stages: ["Everyone"] as LifeStage[],
  };
}
