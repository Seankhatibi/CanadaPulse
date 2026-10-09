import type { NormalizedRelease } from "@/lib/release-hub";

export const lifeStages = ["Everyone", "Student", "Starting work", "Renter", "New family", "Homeowner"] as const;
export type LifeStage = typeof lifeStages[number];

export function lifeContext(release: NormalizedRelease) {
  const text = `${release.title} ${release.releaseType}`.toLowerCase();
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
