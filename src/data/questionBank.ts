export type Question = {
  id: string;
  tier: number;
  question_text: string;
  options: string[];
};

// ─── TIER 1: Beginner — MVP, Roadmaps, Basic ML Concepts ───────────────────

const T1: Question[] = [
  {
    id: "t1-01",
    tier: 1,
    question_text: "What does MVP stand for in product development?",
    options: [
      "Most Valuable Product",
      "Minimum Viable Product",
      "Maximum Value Proposition",
      "Minimum Validated Prototype",
    ],
  },
  {
    id: "t1-02",
    tier: 1,
    question_text:
      "Which of the following best describes supervised machine learning?",
    options: [
      "The model learns by exploring the environment and receiving rewards",
      "The model learns patterns from labeled training data",
      "The model groups data without any predefined categories",
      "The model generates new data by sampling from a distribution",
    ],
  },
  {
    id: "t1-03",
    tier: 1,
    question_text:
      "On a product roadmap, what is the primary purpose of a 'Now/Next/Later' framework?",
    options: [
      "To assign story points to engineering tasks",
      "To communicate product priorities at a high level without committing to dates",
      "To track sprint velocity across quarters",
      "To define the go-to-market timeline for a launch",
    ],
  },
  {
    id: "t1-04",
    tier: 1,
    question_text:
      "A product manager wants to validate whether users actually need a new AI feature before building it. What is the MOST cost-effective approach?",
    options: [
      "Build the full feature and measure adoption after launch",
      "Run a fake-door test by adding a button that shows a 'coming soon' message",
      "Commission a 6-month market research study",
      "File a patent to protect the idea first",
    ],
  },
  {
    id: "t1-05",
    tier: 1,
    question_text:
      "Which of the following is an example of unsupervised machine learning?",
    options: [
      "Training a spam filter on emails labeled 'spam' and 'not spam'",
      "Predicting house prices from historical sale data",
      "Clustering customers by purchasing behavior without predefined groups",
      "Teaching a robot to walk using trial-and-error rewards",
    ],
  },
  {
    id: "t1-06",
    tier: 1,
    question_text:
      "In the context of an AI product, what does 'model inference' refer to?",
    options: [
      "The process of training a model on a dataset",
      "Using a trained model to generate predictions on new data",
      "Evaluating a model's performance on a held-out test set",
      "Fine-tuning a pre-trained model on domain-specific data",
    ],
  },
  {
    id: "t1-07",
    tier: 1,
    question_text:
      "Which roadmap artifact is most useful for aligning executives on annual product strategy?",
    options: [
      "Sprint backlog",
      "Release burn-down chart",
      "Outcome-based roadmap showing problems to solve by quarter",
      "Detailed Gantt chart with feature-level tasks",
    ],
  },
  {
    id: "t1-08",
    tier: 1,
    question_text:
      "What is the main difference between a feature and a user story?",
    options: [
      "Features describe technical implementation; user stories describe test cases",
      "A user story expresses a capability from the user's perspective with context, while a feature is a higher-level product capability",
      "User stories are written by engineers; features are written by designers",
      "There is no meaningful difference; the terms are interchangeable",
    ],
  },
  {
    id: "t1-09",
    tier: 1,
    question_text:
      "A recommendation engine suggests products to users based on what similar users purchased. This is called:",
    options: [
      "Content-based filtering",
      "Collaborative filtering",
      "Reinforcement learning",
      "Generative modeling",
    ],
  },
  {
    id: "t1-10",
    tier: 1,
    question_text:
      "When writing acceptance criteria, which format is most widely adopted in agile product teams?",
    options: [
      "If-When-Then",
      "Given-When-Then (Gherkin)",
      "Assume-Act-Assert",
      "Arrange-Act-Verify",
    ],
  },
  {
    id: "t1-11",
    tier: 1,
    question_text:
      "What is 'training data' in the context of a machine learning model?",
    options: [
      "The documentation engineers use to learn how to deploy the model",
      "The labeled or unlabeled examples the model learns patterns from",
      "The test cases QA runs against the model's API",
      "The configuration files that define the model architecture",
    ],
  },
  {
    id: "t1-12",
    tier: 1,
    question_text:
      "Which of the following is the BEST early signal that an MVP is delivering value?",
    options: [
      "The engineering team hit the sprint deadline",
      "The app store listing received positive reviews from the team",
      "A cohort of target users returned to use the product unprompted",
      "The product has more features than the leading competitor",
    ],
  },
  {
    id: "t1-13",
    tier: 1,
    question_text:
      "What does 'overfitting' mean in machine learning?",
    options: [
      "The model performs well on training data but poorly on unseen data",
      "The model performs poorly on both training and test data",
      "The model takes too long to train due to a large dataset",
      "The model uses more memory than the hardware allows",
    ],
  },
  {
    id: "t1-14",
    tier: 1,
    question_text:
      "A stakeholder asks you to add a feature 'because the CEO wants it.' What should you do first?",
    options: [
      "Add it to the top of the backlog immediately",
      "Refuse the request since it doesn't come from user research",
      "Seek to understand the underlying problem or goal the CEO is trying to address",
      "Estimate the engineering effort and schedule it for next quarter",
    ],
  },
  {
    id: "t1-15",
    tier: 1,
    question_text:
      "In a product context, what is a 'north star metric'?",
    options: [
      "The revenue target set by the CFO for the fiscal year",
      "A single metric that best captures the core value delivered to users",
      "The number of features shipped per quarter",
      "The NPS score threshold required to proceed with a launch",
    ],
  },
];

// ─── TIER 2: Easy-Intermediate — Metrics, Prioritization ────────────────────

const T2: Question[] = [
  {
    id: "t2-01",
    tier: 2,
    question_text:
      "Your AI feature has a 7-day retention rate of 40% in week 1 and 38% in week 2. What does this trend most likely indicate?",
    options: [
      "The feature has a serious bug that needs immediate fixing",
      "Retention is flattening, suggesting the feature is finding its engaged user base",
      "The feature should be deprecated immediately",
      "You need to double the marketing spend to drive more installs",
    ],
  },
  {
    id: "t2-02",
    tier: 2,
    question_text:
      "The RICE prioritization framework scores items by:",
    options: [
      "Revenue, Impact, Cost, Effort",
      "Reach × Impact × Confidence ÷ Effort",
      "Risk, Integration, Complexity, Execution",
      "Return, Investment, Customer, Experience",
    ],
  },
  {
    id: "t2-03",
    tier: 2,
    question_text:
      "Which metric best measures whether an AI recommendation feature is driving the intended user action?",
    options: [
      "Model accuracy on the test set",
      "Click-through rate on recommended items",
      "API latency at the 99th percentile",
      "Number of model parameters",
    ],
  },
  {
    id: "t2-04",
    tier: 2,
    question_text:
      "A PM is deciding between four features. Feature A has high user impact but low strategic alignment. Feature B has medium impact and high alignment. Feature C is a quick win with low impact. Feature D is a bet on a new market. Which prioritization framework is MOST useful here?",
    options: [
      "RICE scoring alone",
      "A 2×2 matrix plotting impact vs. strategic alignment",
      "Story point estimation",
      "Cost-of-delay calculation",
    ],
  },
  {
    id: "t2-05",
    tier: 2,
    question_text:
      "What does DAU/MAU ratio measure for an AI product?",
    options: [
      "The ratio of desktop to mobile users",
      "User engagement stickiness — how often monthly users return daily",
      "The percentage of active users who have completed onboarding",
      "Daily acquisition rate relative to monthly churn",
    ],
  },
  {
    id: "t2-06",
    tier: 2,
    question_text:
      "When using the Kano model, which category describes features that users don't explicitly ask for but whose absence causes dissatisfaction?",
    options: [
      "Performance features",
      "Excitement features",
      "Basic (must-be) features",
      "Indifferent features",
    ],
  },
  {
    id: "t2-07",
    tier: 2,
    question_text:
      "An AI chatbot's CSAT score drops after a model update. The error logs show no increase in errors. What should the PM investigate first?",
    options: [
      "Infrastructure costs",
      "Changes in response tone, length, or accuracy that degraded user experience",
      "The number of new users acquired post-update",
      "Whether the engineering team followed the deployment checklist",
    ],
  },
  {
    id: "t2-08",
    tier: 2,
    question_text:
      "What is the primary weakness of using story points for AI/ML feature estimation?",
    options: [
      "Engineers dislike the process of planning poker",
      "ML tasks have high uncertainty in both effort and outcome, making point estimates unreliable",
      "Story points cannot be tracked in most project management tools",
      "Story points are only valid for frontend features",
    ],
  },
  {
    id: "t2-09",
    tier: 2,
    question_text:
      "Which of the following is the best definition of 'precision' in a classification model?",
    options: [
      "The proportion of actual positives correctly identified",
      "The proportion of predicted positives that are actually positive",
      "The overall percentage of correct predictions",
      "The harmonic mean of sensitivity and specificity",
    ],
  },
  {
    id: "t2-10",
    tier: 2,
    question_text:
      "You have limited engineering capacity. Using cost-of-delay prioritization, which feature should you build first?",
    options: [
      "Feature with the highest development cost",
      "Feature where every week of delay causes the greatest loss in business value",
      "Feature requested most frequently in user surveys",
      "Feature with the lowest technical risk",
    ],
  },
  {
    id: "t2-11",
    tier: 2,
    question_text:
      "A PM notices the AI feature funnel has a 70% drop-off at the 'generate result' step. What is the most diagnostic next step?",
    options: [
      "Immediately rewrite the feature from scratch",
      "Session-replay and user interviews to understand why users are abandoning at that step",
      "Increase server capacity to reduce latency",
      "A/B test a new color scheme for the button",
    ],
  },
  {
    id: "t2-12",
    tier: 2,
    question_text:
      "What does 'recall' (sensitivity) measure in a binary classifier?",
    options: [
      "The proportion of predicted positives that are truly positive",
      "The proportion of actual positives that the model correctly identifies",
      "How quickly the model returns a prediction",
      "The model's accuracy on the minority class only",
    ],
  },
  {
    id: "t2-13",
    tier: 2,
    question_text:
      "Which OKR structure is best suited for an AI product team launching a new personalization feature?",
    options: [
      "Objective: Ship personalization feature. KR: 100% of backlog items completed.",
      "Objective: Delight users with relevant content. KR1: Increase CTR on recommendations by 20%. KR2: Improve 30-day retention by 5%.",
      "Objective: Improve model accuracy. KR: Achieve 95% accuracy on test set.",
      "Objective: Beat competition. KR: Feature parity with top 3 competitors.",
    ],
  },
  {
    id: "t2-14",
    tier: 2,
    question_text:
      "In the MoSCoW framework, items labeled 'Should Have' are best described as:",
    options: [
      "Non-negotiable for the release to function",
      "Important but not critical; included if time permits",
      "Nice-to-have items deferred to a future release",
      "Items to be removed from scope entirely",
    ],
  },
  {
    id: "t2-15",
    tier: 2,
    question_text:
      "Your AI feature shows strong activation (users try it) but weak retention (they don't return). What is the most likely root cause?",
    options: [
      "The marketing copy is misleading about the feature's capabilities",
      "The feature delivers insufficient recurring value to become habitual",
      "The model accuracy is too high, making results seem unnatural",
      "The onboarding flow is too long",
    ],
  },
];

// ─── TIER 3: Intermediate — A/B Testing, Product Analytics ─────────────────

const T3: Question[] = [
  {
    id: "t3-01",
    tier: 3,
    question_text:
      "In an A/B test for an AI feature, what does 'statistical significance' mean in practical terms?",
    options: [
      "The treatment group is larger than the control group",
      "The observed difference is unlikely to be due to random chance, given the chosen alpha level",
      "The feature improved the metric by a meaningful business amount",
      "The test ran for the full pre-specified duration",
    ],
  },
  {
    id: "t3-02",
    tier: 3,
    question_text:
      "You run an A/B test and get p = 0.03 with a 1% relative lift in revenue. Your pre-specified alpha was 0.05. What is the correct conclusion?",
    options: [
      "Ship the feature — it's statistically and practically significant",
      "The result is statistically significant, but you should evaluate whether a 1% lift justifies the maintenance cost",
      "Re-run the test with a smaller sample to confirm",
      "The test failed because the lift is below 5%",
    ],
  },
  {
    id: "t3-03",
    tier: 3,
    question_text:
      "What is 'novelty effect' in A/B testing and how should PMs handle it?",
    options: [
      "A bug that causes new users to behave differently; exclude them from analysis",
      "An inflated metric for the treatment group because users are curious about something new, not because it's better; mitigated by running the test long enough for behavior to normalize",
      "A statistical artifact caused by running too many simultaneous tests",
      "A bias where engineers favor the variant they built",
    ],
  },
  {
    id: "t3-04",
    tier: 3,
    question_text:
      "Which of the following is an example of a guardrail metric in an A/B test?",
    options: [
      "The primary metric you are trying to improve",
      "A metric you must not degrade, even if the primary metric improves",
      "The minimum detectable effect you set during power analysis",
      "The holdout group used to measure long-term experiment impact",
    ],
  },
  {
    id: "t3-05",
    tier: 3,
    question_text:
      "A cohort analysis of an AI writing assistant shows week-4 retention drops from 60% to 15% for users who signed up in January vs. March. What should the PM investigate?",
    options: [
      "Seasonality in word processing demand",
      "A change in onboarding, model quality, or product experience between those cohorts",
      "Server capacity issues in Q1",
      "Differences in device types between cohorts",
    ],
  },
  {
    id: "t3-06",
    tier: 3,
    question_text:
      "What is 'Simpson's Paradox' and why does it matter for product analytics?",
    options: [
      "A trend that appears in aggregate data reverses when data is segmented by a confounding variable",
      "An A/B test that shows opposite results on desktop vs. mobile",
      "A model that performs well on training data but poorly in production",
      "A metric that improves for power users but degrades for new users simultaneously",
    ],
  },
  {
    id: "t3-07",
    tier: 3,
    question_text:
      "What is the purpose of a 'holdout group' (also called a holdback) in AI product experimentation?",
    options: [
      "A subset of training data withheld during model training to evaluate generalization",
      "A permanent control group never exposed to the product change, used to measure long-term impact",
      "Users who opted out of the A/B test program",
      "The group with the highest LTV used to calibrate model predictions",
    ],
  },
  {
    id: "t3-08",
    tier: 3,
    question_text:
      "In funnel analysis for an AI feature, you notice a 40% drop between 'feature discovered' and 'first generation.' What metric would MOST directly explain this?",
    options: [
      "Time-to-first-generation (latency)",
      "Session duration",
      "Feature discoverability score",
      "Model F1 score",
    ],
  },
  {
    id: "t3-09",
    tier: 3,
    question_text:
      "What is the minimum sample size calculation for an A/B test based on?",
    options: [
      "The available engineering bandwidth",
      "The desired statistical power, significance level, and minimum detectable effect",
      "The number of features in the product",
      "The historical standard deviation of revenue only",
    ],
  },
  {
    id: "t3-10",
    tier: 3,
    question_text:
      "A PM wants to measure whether an AI feature is driving business outcomes, not just engagement. Which metric hierarchy is most appropriate?",
    options: [
      "Model accuracy → API calls → DAU",
      "Clicks → Sessions → Feature usage",
      "Feature adoption → Activation → Retention → Revenue impact",
      "Error rate → Latency → Throughput",
    ],
  },
  {
    id: "t3-11",
    tier: 3,
    question_text:
      "What is 'p-hacking' and why is it a problem in product experiments?",
    options: [
      "Running tests on production traffic without a rollback plan",
      "Repeatedly checking results and stopping the test when p < 0.05 is reached, inflating false-positive rates",
      "Using a holdout group that is too small for the experiment",
      "Testing multiple variants simultaneously without Bonferroni correction",
    ],
  },
  {
    id: "t3-12",
    tier: 3,
    question_text:
      "Which analytics technique is best for understanding the sequence of actions that lead to a conversion event in an AI product?",
    options: [
      "Cohort analysis",
      "Funnel analysis",
      "Path analysis (user flow analysis)",
      "Regression analysis",
    ],
  },
  {
    id: "t3-13",
    tier: 3,
    question_text:
      "Your experiment's treatment arm shows a 10% improvement in the primary metric but a 5% increase in customer support contacts. How should you interpret this?",
    options: [
      "Ship it — the primary metric improvement outweighs support cost",
      "Investigate whether the feature is creating confusion or errors that drive support, and model the net business impact",
      "Discard the experiment — any guardrail metric degradation is disqualifying",
      "Re-run with a smaller user sample to reduce support volume",
    ],
  },
  {
    id: "t3-14",
    tier: 3,
    question_text:
      "What is a 'switchback experiment' and when is it used in AI products?",
    options: [
      "An experiment that switches users between variants every session to reduce novelty effect",
      "A time-based experiment used when user-level randomization is impossible (e.g., marketplace algorithms affecting all users)",
      "A method to roll back a bad feature deployment automatically",
      "An A/B test variant where users can opt in or out",
    ],
  },
  {
    id: "t3-15",
    tier: 3,
    question_text:
      "An AI feature's engagement looks strong in aggregate analytics. A PM segments by user tenure and finds new users love it but power users show declining engagement. What is the correct course of action?",
    options: [
      "Optimize entirely for new users since they're the growth vector",
      "Remove the feature since it harms power users",
      "Investigate whether the feature meets different needs across segments and consider adaptive experiences",
      "Increase the feature's prominence in the UI for all users",
    ],
  },
];

// ─── TIER 4: Intermediate-Hard — ML Model Evaluation, PRDs ─────────────────

const T4: Question[] = [
  {
    id: "t4-01",
    tier: 4,
    question_text:
      "When writing a PRD for an AI feature, which section is most critical to include that is typically absent from a non-AI PRD?",
    options: [
      "User personas and journey maps",
      "Model performance thresholds, data requirements, and failure mode specifications",
      "Competitive analysis and market sizing",
      "Go-to-market timeline and launch checklist",
    ],
  },
  {
    id: "t4-02",
    tier: 4,
    question_text:
      "Your fraud detection model has precision = 0.98 and recall = 0.40. What is the business implication?",
    options: [
      "The model is very conservative — it rarely flags legitimate users as fraudulent but misses 60% of actual fraud",
      "The model is too aggressive — it flags too many legitimate users",
      "The model is well-balanced and ready for production",
      "The model needs more training data to improve precision",
    ],
  },
  {
    id: "t4-03",
    tier: 4,
    question_text:
      "What is the ROC-AUC score and what business question does it help answer for a PM?",
    options: [
      "The average revenue per user from AI-driven recommendations",
      "A threshold-independent measure of a classifier's ability to discriminate between classes — useful for comparing model versions",
      "The ratio of online to offline model evaluation performance",
      "The model's performance on the underrepresented class in imbalanced datasets",
    ],
  },
  {
    id: "t4-04",
    tier: 4,
    question_text:
      "In an AI PRD, what does 'model latency SLA' refer to and why should a PM care?",
    options: [
      "The time it takes to retrain the model — affects how quickly it adapts to new data",
      "The maximum acceptable inference time per request — directly affects user experience and determines infrastructure requirements",
      "The delay between feature request and engineering start",
      "The time required to generate model explanations for auditing",
    ],
  },
  {
    id: "t4-05",
    tier: 4,
    question_text:
      "Why is accuracy a misleading metric for a model that predicts rare events (e.g., 1% fraud rate)?",
    options: [
      "Accuracy is only valid for regression models",
      "A model that predicts 'not fraud' for every transaction achieves 99% accuracy while being useless",
      "Accuracy cannot be calculated when classes are imbalanced",
      "Rare-event models require AUC > 0.99 to be considered accurate",
    ],
  },
  {
    id: "t4-06",
    tier: 4,
    question_text:
      "A PM is evaluating two model versions for a content moderation system. Model A: precision 0.85, recall 0.90. Model B: precision 0.95, recall 0.70. Which should you deploy if minimizing false positives (wrongly removed content) is the top priority?",
    options: [
      "Model A — it has better recall",
      "Model B — it has higher precision, meaning fewer legitimate posts are removed",
      "Neither — both models are insufficient",
      "Model A — F1 is more important than individual metrics",
    ],
  },
  {
    id: "t4-07",
    tier: 4,
    question_text:
      "What should be included in the 'failure modes' section of an AI PRD?",
    options: [
      "The list of bugs found in the previous sprint",
      "Specific conditions where the model is expected to underperform, edge cases, and the product fallback behavior",
      "The SLA for engineering incident response",
      "The post-launch retrospective template",
    ],
  },
  {
    id: "t4-08",
    tier: 4,
    question_text:
      "What is 'data drift' and why does it matter for an AI product PM?",
    options: [
      "The gradual accumulation of technical debt in the data pipeline",
      "A shift in the statistical distribution of production input data compared to training data, which degrades model performance over time",
      "The process of migrating from one data warehouse to another",
      "Version mismatches between feature store and model training pipelines",
    ],
  },
  {
    id: "t4-09",
    tier: 4,
    question_text:
      "In a PRD for a generative AI feature, why is 'output quality evaluation' harder to specify than for a traditional ML classifier?",
    options: [
      "Generative models are always more accurate, so thresholds are unnecessary",
      "Generated text/images have no ground truth to compare against; quality is subjective and requires human evaluation rubrics or proxy metrics",
      "Generative models don't make errors, so evaluation is irrelevant",
      "Output evaluation for generative models is handled entirely by the legal team",
    ],
  },
  {
    id: "t4-10",
    tier: 4,
    question_text:
      "What is a confusion matrix and how does a PM use it?",
    options: [
      "A matrix showing cross-functional team dependencies for an AI project",
      "A table showing TP, FP, TN, FN counts that helps PMs understand where a model makes specific types of mistakes",
      "A visualization of model training loss over epochs",
      "A framework for comparing two competing feature proposals",
    ],
  },
  {
    id: "t4-11",
    tier: 4,
    question_text:
      "Why should an AI PRD specify a 'model versioning and rollback' plan?",
    options: [
      "Because regulators require version numbers on all software",
      "Because model updates can silently degrade user experience; versioning enables fast rollback to a known-good state",
      "Because it's required for app store submission",
      "Because ML models always improve with every update",
    ],
  },
  {
    id: "t4-12",
    tier: 4,
    question_text:
      "You're reviewing model evaluation results and notice the F1 score is 0.82 on the test set but 0.61 on a recent production sample. What does this tell you?",
    options: [
      "The model is performing as expected — test and production scores never match",
      "There is a train-test distribution mismatch; the model generalizes poorly to real production data",
      "The production infrastructure is throttling model calls",
      "The test set was too large and needs to be reduced",
    ],
  },
  {
    id: "t4-13",
    tier: 4,
    question_text:
      "Which acceptance criterion in an AI PRD is best phrased?",
    options: [
      "The model should be 'smart enough' to handle most user queries",
      "Given a user query in English, the model returns a relevant response with latency < 500ms at the p95 level, and the content safety classifier flags < 0.1% of responses",
      "The AI feature should work well for all users",
      "The model accuracy should be high on the validation set",
    ],
  },
  {
    id: "t4-14",
    tier: 4,
    question_text:
      "What is 'concept drift' as distinct from 'data drift' in an ML system?",
    options: [
      "Concept drift is about infrastructure changes; data drift is about model architecture changes",
      "Data drift is a change in input feature distributions; concept drift is a change in the underlying relationship between inputs and the target variable",
      "They are synonyms for the same phenomenon",
      "Concept drift only affects NLP models; data drift affects all model types",
    ],
  },
  {
    id: "t4-15",
    tier: 4,
    question_text:
      "A PM is defining the 'definition of done' for an ML feature. Which set of criteria is most complete?",
    options: [
      "Model trained, code merged, tests passing",
      "Model meets performance thresholds on held-out data, latency SLAs validated under load, A/B test designed, monitoring/alerting configured, rollback plan documented",
      "Feature shipped to 100% of users without errors",
      "Stakeholder sign-off and marketing page live",
    ],
  },
];

// ─── TIER 5: Advanced — AI Ethics, Bias, Responsible AI ────────────────────

const T5: Question[] = [
  {
    id: "t5-01",
    tier: 5,
    question_text:
      "A hiring AI trained on historical resumes systematically down-ranks candidates from certain universities. This is an example of:",
    options: [
      "Underfitting — the model didn't learn enough from the data",
      "Historical bias encoded in training data being amplified by the model",
      "A data pipeline bug that needs a hotfix",
      "Intentional discrimination by the engineering team",
    ],
  },
  {
    id: "t5-02",
    tier: 5,
    question_text:
      "What is 'demographic parity' as an algorithmic fairness criterion?",
    options: [
      "Each demographic group has equal representation in the training dataset",
      "The positive prediction rate is equal across demographic groups",
      "The model achieves equal accuracy across demographic groups",
      "All groups have equal false negative rates",
    ],
  },
  {
    id: "t5-03",
    tier: 5,
    question_text:
      "Why is it mathematically impossible to simultaneously satisfy demographic parity, equal opportunity, and calibration when base rates differ across groups?",
    options: [
      "It's a software engineering limitation that will be solved with more compute",
      "Impossibility theorems (Chouldechova, Kleinberg et al.) prove these criteria conflict when group prevalence rates differ — PMs must make explicit fairness trade-offs",
      "This only applies to regression models, not classifiers",
      "It is possible with sufficient training data from each group",
    ],
  },
  {
    id: "t5-04",
    tier: 5,
    question_text:
      "What is 'explainability' (XAI) and when should a PM require it as a product feature?",
    options: [
      "The ability to describe the model architecture to investors; required for all AI products",
      "The ability to provide interpretable reasons for a model's prediction; required for high-stakes decisions (credit, hiring, medical) where users or regulators need to understand outcomes",
      "Documentation for the model API, required for third-party integrations",
      "A legal disclaimer appended to AI-generated outputs",
    ],
  },
  {
    id: "t5-05",
    tier: 5,
    question_text:
      "Your AI product collects behavioral data to personalize recommendations. Under GDPR, what right do EU users have regarding this data?",
    options: [
      "The right to receive cash compensation for data usage",
      "The right to access, rectify, and erase personal data, and to object to automated decision-making",
      "The right to request the model's source code",
      "The right to opt into data collection but not out",
    ],
  },
  {
    id: "t5-06",
    tier: 5,
    question_text:
      "What is 'algorithmic accountability' and how does it translate into product requirements?",
    options: [
      "Making sure the ML team is accountable to the PM for sprint deliverables",
      "Establishing clear ownership of model decisions, audit trails, mechanisms for contesting outputs, and processes for remediating harms",
      "Publishing the model's accuracy metrics on the company blog",
      "Ensuring the legal team reviews the model before launch",
    ],
  },
  {
    id: "t5-07",
    tier: 5,
    question_text:
      "A facial recognition system has 99% accuracy overall but 85% accuracy for dark-skinned women. What is this phenomenon called and what should a PM do?",
    options: [
      "Noise in the dataset; retrain with more data overall",
      "Differential performance across demographic subgroups (often called 'subgroup fairness' failure); conduct a bias audit, collect representative data, and set subgroup performance thresholds in the PRD",
      "An expected trade-off inherent to all vision models",
      "A hardware calibration issue with the camera sensor",
    ],
  },
  {
    id: "t5-08",
    tier: 5,
    question_text:
      "What is 'feedback loop amplification' in an AI recommendation system?",
    options: [
      "A latency problem caused by too many API calls",
      "When model predictions influence user behavior, which generates training data that reinforces those same predictions, creating runaway filter bubbles",
      "A data pipeline that processes feedback forms from users",
      "When engineers act on model predictions to bias the training data intentionally",
    ],
  },
  {
    id: "t5-09",
    tier: 5,
    question_text:
      "Under the EU AI Act (2024), systems used for credit scoring, hiring, and essential services are classified as:",
    options: [
      "Prohibited AI systems that must be shut down immediately",
      "High-risk AI systems subject to mandatory conformity assessments, bias audits, and human oversight requirements",
      "Limited-risk systems requiring only transparency notifications",
      "Minimal-risk systems with no specific regulatory obligations",
    ],
  },
  {
    id: "t5-10",
    tier: 5,
    question_text:
      "What is 'human-in-the-loop' (HITL) and when is it required in an AI product?",
    options: [
      "A design pattern where users interact with the model output; required for all AI products",
      "A system where humans review, validate, or override AI decisions; required when model confidence is low, outcomes are high-stakes, or regulations mandate oversight",
      "A development practice where engineers manually review training data before each training run",
      "A UX pattern requiring users to confirm AI suggestions before they take effect",
    ],
  },
  {
    id: "t5-11",
    tier: 5,
    question_text:
      "What does 'model card' documentation provide and why should PMs require it?",
    options: [
      "A summary of the model's API parameters for developers",
      "Structured documentation of a model's intended use, performance across subgroups, known limitations, and ethical considerations — enabling informed deployment decisions",
      "A business case document for model development investment",
      "A legal contract between the AI vendor and the customer",
    ],
  },
  {
    id: "t5-12",
    tier: 5,
    question_text:
      "An AI content moderation system has a higher false-positive rate for African-American Vernacular English (AAVE). This is an example of:",
    options: [
      "A feature, not a bug — dialect filtering is intentional",
      "Representational harm caused by training data underrepresentation of AAVE, resulting in disparate impact on a protected group",
      "A vocabulary mismatch that can be fixed by spell-checking",
      "Expected variance in model performance across rare linguistic inputs",
    ],
  },
  {
    id: "t5-13",
    tier: 5,
    question_text:
      "What is 'differential privacy' and what product use case does it address?",
    options: [
      "Encrypting data in transit between the user and the model API",
      "A mathematical privacy guarantee that limits what an adversary can learn about any individual from aggregate model outputs or statistics — used when publishing model insights or training on sensitive user data",
      "A feature flag that disables personalization for privacy-sensitive users",
      "A legal agreement limiting data use to specified purposes",
    ],
  },
  {
    id: "t5-14",
    tier: 5,
    question_text:
      "A PM launches an AI job recommender that optimizes for 'time to apply.' Over six months, it begins funneling certain demographics toward lower-wage roles. This is an example of:",
    options: [
      "Intended product behavior — the model is optimizing the specified metric",
      "Metric misalignment causing proxy gaming with discriminatory downstream effects; the optimization target did not capture the intended social outcome",
      "A GDPR violation that should be reported to authorities",
      "A bug in the recommendation engine that can be patched",
    ],
  },
  {
    id: "t5-15",
    tier: 5,
    question_text:
      "What is 'consent' in the context of training an AI model on user-generated content, and what should a PM include in the product policy?",
    options: [
      "Consent is not needed if the content was publicly posted",
      "Explicit or granular opt-in consent for data use in model training, clear disclosure of how data is used, and the ability to withdraw consent and have data removed from future training runs",
      "A one-time terms of service agreement covering all future uses",
      "Consent is only required for health and financial data under HIPAA/GLBA",
    ],
  },
];

// ─── TIER 6: Advanced — LLM Product Strategy ────────────────────────────────

const T6: Question[] = [
  {
    id: "t6-01",
    tier: 6,
    question_text:
      "What is 'prompt engineering' as a product capability, and what is its primary limitation?",
    options: [
      "Designing the user interface for AI prompts; limited by screen real estate",
      "Crafting input instructions to guide LLM behavior without changing model weights; limited because it's brittle — model updates can break carefully tuned prompts",
      "Writing training data for fine-tuning; limited by annotation cost",
      "Optimizing server-side caching for LLM API calls; limited by token budget",
    ],
  },
  {
    id: "t6-02",
    tier: 6,
    question_text:
      "In LLM product strategy, what is 'context window' and why is it a critical product constraint?",
    options: [
      "The UI viewport that displays AI responses to users",
      "The maximum amount of text (tokens) an LLM can process in a single request — it limits the length of conversations, documents, and retrieved knowledge an AI feature can handle",
      "The time window during which model responses are cached",
      "The geographic region where the model's servers are located",
    ],
  },
  {
    id: "t6-03",
    tier: 6,
    question_text:
      "What is Retrieval-Augmented Generation (RAG) and what problem does it solve for LLM products?",
    options: [
      "A fine-tuning technique that reduces hallucinations by adding human feedback",
      "An architecture that retrieves relevant documents from a knowledge base and injects them into the LLM's context at inference time — solving knowledge cutoff and factual grounding limitations",
      "A compression method that reduces LLM API costs by caching common responses",
      "A safety filter that removes harmful content from LLM outputs",
    ],
  },
  {
    id: "t6-04",
    tier: 6,
    question_text:
      "A PM must decide between building on top of a foundation model API (e.g., GPT-4) vs. fine-tuning an open-source model. What is the PRIMARY trade-off?",
    options: [
      "API: always cheaper; fine-tuning: always better quality",
      "API: faster time-to-market, lower upfront cost, but vendor lock-in, less customization, higher per-call cost at scale; fine-tuning: higher control, data privacy, lower marginal cost at scale, but requires ML expertise and infrastructure",
      "API: requires more data; fine-tuning: requires less data",
      "Fine-tuning is only viable for image models, not language models",
    ],
  },
  {
    id: "t6-05",
    tier: 6,
    question_text:
      "What is 'hallucination' in LLMs and what product mechanisms can mitigate it?",
    options: [
      "When the LLM generates visually confusing outputs; fixed by UI redesign",
      "When an LLM generates fluent but factually incorrect or fabricated information; mitigated by RAG, grounding to source documents, confidence scoring, citations, and RLHF",
      "When the LLM interprets ambiguous user queries incorrectly; fixed by query expansion",
      "When the LLM returns an error due to context window overflow",
    ],
  },
  {
    id: "t6-06",
    tier: 6,
    question_text:
      "What does 'tokens per second' (TPS) mean as a product metric for an LLM feature?",
    options: [
      "The number of API authentication tokens processed per second",
      "The generation speed of the LLM — directly determines perceived responsiveness; streaming output can mask low TPS by showing progressive text",
      "The number of unique users querying the model per second",
      "The rate at which training tokens are processed during fine-tuning",
    ],
  },
  {
    id: "t6-07",
    tier: 6,
    question_text:
      "In an LLM product, what is the purpose of a 'system prompt' and what are its security risks?",
    options: [
      "A server configuration file; risk is misconfiguration causing downtime",
      "Pre-pended instructions that define the LLM's persona, constraints, and capabilities; risk is 'prompt injection' where user inputs override system prompt instructions",
      "A cached response for common queries; risk is serving stale information",
      "The default response shown when the LLM times out; risk is poor UX",
    ],
  },
  {
    id: "t6-08",
    tier: 6,
    question_text:
      "What is 'few-shot prompting' and when is it more appropriate than fine-tuning?",
    options: [
      "Training a model on a small dataset; appropriate for all production deployments",
      "Providing a small number of input-output examples in the prompt to demonstrate the desired behavior; appropriate for rapid iteration, low-data scenarios, and when you need to avoid the cost and latency of fine-tuning",
      "Showing the user a few output samples before they submit their query",
      "A A/B testing strategy where a small cohort tests the new model version",
    ],
  },
  {
    id: "t6-09",
    tier: 6,
    question_text:
      "A PM is evaluating LLM providers for an enterprise product. Which factor is MOST important for regulated industries (healthcare, finance)?",
    options: [
      "The model's score on public benchmarks like MMLU",
      "Data processing agreements, compliance certifications (HIPAA, SOC2), and whether customer data is used for model training",
      "The number of parameters in the model",
      "Whether the provider offers a free tier for prototyping",
    ],
  },
  {
    id: "t6-10",
    tier: 6,
    question_text:
      "What is 'chain-of-thought prompting' and what problem does it solve?",
    options: [
      "Linking multiple LLM API calls in sequence; solves context window limitations",
      "Instructing the LLM to show intermediate reasoning steps before giving a final answer; improves accuracy on complex multi-step reasoning tasks",
      "A UI pattern that shows users the AI's thought process as an animated loader",
      "A fine-tuning technique that improves logical consistency",
    ],
  },
  {
    id: "t6-11",
    tier: 6,
    question_text:
      "What is the 'LLM as judge' evaluation pattern and what are its limitations?",
    options: [
      "Using an LLM to write acceptance criteria for engineering sprints; limited by domain knowledge",
      "Using a strong LLM to score outputs from another model on rubrics like relevance and accuracy; limited by the judge model's own biases and preference for its own style",
      "Using an LLM to review legal contracts before launch; limited by hallucination risk",
      "Using an LLM to prioritize the product backlog; limited by lack of business context",
    ],
  },
  {
    id: "t6-12",
    tier: 6,
    question_text:
      "For an LLM-powered B2B SaaS product, what is 'cost per query' and how should a PM manage it?",
    options: [
      "The customer acquisition cost for B2B sales; managed through marketing spend",
      "The inference cost per API call (input + output tokens × price/1M tokens); managed through prompt optimization, response caching, model routing, and tiered pricing models",
      "The cost of annotating one training example; managed through crowdsourcing",
      "The compute cost of running A/B tests; managed through sample size reduction",
    ],
  },
  {
    id: "t6-13",
    tier: 6,
    question_text:
      "What is 'model routing' in an LLM product architecture and why is it a product strategy decision?",
    options: [
      "Routing user traffic to different geographic server regions for latency",
      "Dynamically selecting the appropriate model (e.g., small/fast vs. large/smart) based on query complexity — balancing cost, latency, and quality at the product level",
      "Directing specific user roles to different product features",
      "A load balancing strategy for high-traffic API deployments",
    ],
  },
  {
    id: "t6-14",
    tier: 6,
    question_text:
      "What strategic moat can an LLM product build that is difficult for competitors to replicate?",
    options: [
      "Access to the largest foundation model (easily matched when new models are released)",
      "A proprietary high-quality dataset, user behavior feedback loops that improve the model, deep workflow integration, and switching costs via embedded user data",
      "Being the first to market with any LLM feature",
      "Having the most features in the product",
    ],
  },
  {
    id: "t6-15",
    tier: 6,
    question_text:
      "What is 'grounding' in the context of an LLM product and how does it affect user trust?",
    options: [
      "Connecting the model to real-time internet search; always increases trust",
      "Anchoring model responses to specific, verifiable source documents and surfacing citations — enabling users to verify claims and reducing the trust cost of hallucinations",
      "Training the model on factual datasets to reduce creative output",
      "A UI design principle that uses familiar visual metaphors for AI features",
    ],
  },
];

// ─── TIER 7: Expert — Model Fine-Tuning Product Decisions ───────────────────

const T7: Question[] = [
  {
    id: "t7-01",
    tier: 7,
    question_text:
      "When should a PM prioritize fine-tuning a foundation model over prompt engineering for a production use case?",
    options: [
      "Always — fine-tuning produces better results in all cases",
      "When prompt engineering has plateaued, the task requires consistent style/format, latency/cost at scale demands a smaller model, or data privacy prevents sending content to an external API",
      "When the foundation model API is too expensive for prototyping",
      "When the engineering team has idle GPU capacity",
    ],
  },
  {
    id: "t7-02",
    tier: 7,
    question_text:
      "What is LoRA (Low-Rank Adaptation) and why does it matter for product decisions?",
    options: [
      "A latency optimization layer that reduces API call overhead",
      "A parameter-efficient fine-tuning technique that trains small adapter matrices rather than all model weights — dramatically reducing compute cost and enabling multiple task-specific adapters on one base model",
      "A data augmentation strategy for low-resource languages",
      "A retrieval architecture that reduces hallucination in RAG systems",
    ],
  },
  {
    id: "t7-03",
    tier: 7,
    question_text:
      "A PM is building a fine-tuned model for customer support. The team argues they need 1M training examples. What should the PM challenge?",
    options: [
      "Nothing — more data always improves fine-tuned model quality",
      "Modern fine-tuning of large models often achieves good results with hundreds to a few thousand high-quality examples; quality trumps quantity — the PM should push for data curation over raw collection",
      "The team should use unsupervised learning instead",
      "The PM should redirect to building a rules-based system instead",
    ],
  },
  {
    id: "t7-04",
    tier: 7,
    question_text:
      "What is 'catastrophic forgetting' in the context of fine-tuning and how should a PM account for it in product requirements?",
    options: [
      "When a model forgets system prompt instructions during a long conversation",
      "When fine-tuning on a narrow task degrades the model's general capabilities; PMs should require evaluation on general capability benchmarks (not just task performance) and consider continual learning strategies",
      "When training data is accidentally deleted from the data pipeline",
      "When users forget how to use AI features after a UI redesign",
    ],
  },
  {
    id: "t7-05",
    tier: 7,
    question_text:
      "What is RLHF (Reinforcement Learning from Human Feedback) and what product outcome does it primarily optimize?",
    options: [
      "A technique that teaches models to play games; primarily optimizes game scores",
      "A training approach using human preference judgments to fine-tune model behavior toward being helpful, harmless, and honest — primarily optimizes alignment with human values rather than raw capability",
      "A data collection method for training recommendation systems",
      "A model compression technique that reduces inference cost",
    ],
  },
  {
    id: "t7-06",
    tier: 7,
    question_text:
      "A PM is evaluating whether to fine-tune on proprietary customer data. What is the PRIMARY data governance risk to address first?",
    options: [
      "The fine-tuned model might run slower than the base model",
      "Customer data used in training may be memorized and reproduced to other customers (training data leakage), violating privacy agreements — requires differential privacy, data segregation, or per-tenant models",
      "Fine-tuning voids the model provider's API terms of service",
      "The training job might take too long for the sprint timeline",
    ],
  },
  {
    id: "t7-07",
    tier: 7,
    question_text:
      "What is 'instruction tuning' and how does it differ from task-specific fine-tuning?",
    options: [
      "They are identical — the terms are interchangeable",
      "Instruction tuning trains a model to follow natural language instructions across many tasks; task-specific fine-tuning optimizes for one narrow task. Instruction tuning produces more generalizable, instruction-following assistants",
      "Instruction tuning uses synthetic data; task-specific fine-tuning requires human annotation",
      "Instruction tuning is for text models; task-specific fine-tuning is for vision models",
    ],
  },
  {
    id: "t7-08",
    tier: 7,
    question_text:
      "How should a PM structure the evaluation framework for a fine-tuned enterprise LLM before production deployment?",
    options: [
      "Human eval only — run 10 internal tests and get stakeholder sign-off",
      "Automated offline evals (task-specific benchmarks, regression on holdout set), human eval on adversarial and edge cases, red-teaming for safety, A/B testing against baseline in shadow mode before full rollout",
      "Compare BLEU score to the base model and ship if improved",
      "User acceptance testing only — have 5 beta customers try it for a week",
    ],
  },
  {
    id: "t7-09",
    tier: 7,
    question_text:
      "What is the business case for fine-tuning a smaller open-source model vs. continuing to use a large frontier API model?",
    options: [
      "Smaller models always outperform large models on specialized tasks",
      "At sufficient query volume, fine-tuned smaller models offer lower per-query cost, predictable latency, data privacy, and can match frontier model quality on narrow tasks — the break-even typically occurs in millions of queries/month",
      "Fine-tuning is free if you use open-source models",
      "Smaller models are easier to explain to regulators",
    ],
  },
  {
    id: "t7-10",
    tier: 7,
    question_text:
      "When a fine-tuned model is deployed to production, what ongoing operational requirements should a PM include in the product spec?",
    options: [
      "No requirements — fine-tuned models don't need maintenance",
      "Continuous evaluation pipeline (shadow scoring), drift monitoring, scheduled retraining triggers, rollback capability, model versioning, and performance dashboards for key task metrics",
      "Weekly manual review of 10 random outputs",
      "A customer feedback form embedded in the UI",
    ],
  },
  {
    id: "t7-11",
    tier: 7,
    question_text:
      "What is 'synthetic data generation' in the fine-tuning context and when does it make sense for a PM to approve it?",
    options: [
      "Creating fake user accounts to test the product; always inappropriate",
      "Using a powerful LLM to generate training examples for fine-tuning a smaller model — appropriate when real data is scarce, privacy-sensitive, or expensive to annotate, but requires validation that synthetic distribution matches real-world distribution",
      "Auto-generating product documentation from code comments",
      "Using GANs to augment image training data",
    ],
  },
  {
    id: "t7-12",
    tier: 7,
    question_text:
      "A PM notices the fine-tuned model performs well on evaluation benchmarks but still receives poor ratings from users in production. What is the most likely explanation?",
    options: [
      "The model needs more training compute",
      "Benchmark-to-production gap: evaluation tasks don't reflect the full diversity of real user inputs; the model hasn't been tested on the long tail of production queries",
      "Users are rating incorrectly — the model is objectively good",
      "The UI is confusing users about what to rate",
    ],
  },
  {
    id: "t7-13",
    tier: 7,
    question_text:
      "What is 'alignment tax' in the context of safety fine-tuning and why does it create a product tension?",
    options: [
      "The legal fees associated with AI compliance programs",
      "The capability degradation that sometimes occurs when fine-tuning for safety/helpfulness — a safer, more aligned model may perform worse on some capability benchmarks, creating a tension between safety and performance",
      "The additional cost of hiring an ethics team",
      "The latency overhead of running safety classifiers on outputs",
    ],
  },
  {
    id: "t7-14",
    tier: 7,
    question_text:
      "What is 'model merging' (e.g., SLERP, TIES) and what product use case does it enable?",
    options: [
      "Combining multiple databases used in model training",
      "Combining weights from multiple fine-tuned models to get a model that inherits properties of each — enabling creation of task-diverse models without separate fine-tuning runs or multi-task training data",
      "A deployment strategy that distributes model inference across multiple servers",
      "A data pipeline technique for merging annotation outputs",
    ],
  },
  {
    id: "t7-15",
    tier: 7,
    question_text:
      "A PM must decide the training data mix for a domain-specific fine-tune. The team proposes 100% domain data. What is the risk and what should the PM recommend?",
    options: [
      "No risk — specialization always improves domain performance",
      "Pure domain data causes catastrophic forgetting of general capabilities and can reduce instruction-following; recommend a mixed curriculum with domain data dominant (70–90%) and general instruction data (10–30%) to preserve baseline behaviors",
      "The training run will take too long with mixed data",
      "Mixed data will confuse the model and degrade domain performance",
    ],
  },
];

// ─── TIER 8: Expert — AI Safety, Alignment Product ──────────────────────────

const T8: Question[] = [
  {
    id: "t8-01",
    tier: 8,
    question_text:
      "What is 'Goodhart's Law' and how does it manifest as an AI product failure mode?",
    options: [
      "A principle stating that larger models always perform better",
      "When a measure becomes a target, it ceases to be a good measure — AI systems optimizing proxy metrics find unexpected ways to score well without achieving the intended goal",
      "The observation that AI products improve in capability with each generation",
      "A market dynamics law stating early AI products capture disproportionate market share",
    ],
  },
  {
    id: "t8-02",
    tier: 8,
    question_text:
      "What is 'reward hacking' in RLHF-trained models and what product safeguards should a PM require?",
    options: [
      "When users manipulate the app to gain reward points; mitigated by rate limiting",
      "When the model finds unintended ways to maximize the reward model's score (e.g., producing verbose, sycophantic responses) rather than the intended behavior; mitigated by diverse reward signals, adversarial testing, and human oversight",
      "When the model refuses to answer questions it hasn't been rewarded for",
      "When an engineer manipulates training labels to improve their team's metrics",
    ],
  },
  {
    id: "t8-03",
    tier: 8,
    question_text:
      "What is 'Constitutional AI' (Anthropic) and what product benefit does it provide vs. standard RLHF?",
    options: [
      "A legal compliance framework for deploying AI in regulated industries",
      "A training method where the model critiques and revises its own outputs against a set of principles — enabling scalable safety training with less human annotation and more transparent, consistent safety behaviors",
      "A governance structure that limits which employees can access model training data",
      "An architecture that adds a safety classifier as a separate model layer",
    ],
  },
  {
    id: "t8-04",
    tier: 8,
    question_text:
      "What is 'jailbreaking' in AI safety terms and what product defenses should a PM require?",
    options: [
      "Rooting a mobile device to install the AI app; defended by app store policies",
      "Adversarial prompt techniques that bypass a model's safety guidelines — defended by layered safety (input filtering, output filtering, system prompt hardening, behavior monitoring, and rate limiting)",
      "Users accessing premium AI features without paying; defended by paywalls",
      "Unauthorized access to model training infrastructure; defended by network security",
    ],
  },
  {
    id: "t8-05",
    tier: 8,
    question_text:
      "What is 'capability elicitation' in AI safety research and why is it a PM concern for frontier model products?",
    options: [
      "A technique for extracting AI-generated content for training data",
      "The process of determining the true capabilities of a model, including dangerous ones that may be latent and only emerge with specific prompts — relevant because products built on frontier models may inadvertently expose dangerous capabilities",
      "A prompt engineering technique for improving model performance on benchmarks",
      "The process of onboarding new engineers to the ML codebase",
    ],
  },
  {
    id: "t8-06",
    tier: 8,
    question_text:
      "A PM is designing an AI agent that can autonomously take actions (send emails, execute code, purchase items). What is the key safety principle for agentic systems?",
    options: [
      "The agent should be as autonomous as possible to maximize productivity",
      "Minimal footprint + explicit user authorization for high-stakes actions — agents should request only necessary permissions, confirm irreversible actions with users, and have configurable scope limits",
      "The agent should log all actions but not require user confirmation to maximize speed",
      "Safety is only relevant when the agent handles financial transactions",
    ],
  },
  {
    id: "t8-07",
    tier: 8,
    question_text:
      "What is 'sycophancy' in LLM alignment and why is it a product quality problem?",
    options: [
      "When the model refuses to disagree with factually incorrect user claims to avoid conflict — reducing the product's truthfulness and eroding trust over time for users who rely on the AI for accurate information",
      "When the model produces overly verbose responses to please users",
      "When the model copies the user's writing style in its responses",
      "When the model answers the same question differently for different users",
    ],
  },
  {
    id: "t8-08",
    tier: 8,
    question_text:
      "What is 'interpretability' research (mechanistic interpretability) and why should a PM at a high-stakes AI company care?",
    options: [
      "UX research on how users understand AI outputs; relevant for consumer products",
      "Research into the internal computational mechanisms of neural networks — understanding what circuits implement what behaviors; relevant for building verifiable safety guarantees beyond empirical testing",
      "Documentation practices for making ML code readable for engineers",
      "A regulatory requirement to publish model architectures",
    ],
  },
  {
    id: "t8-09",
    tier: 8,
    question_text:
      "What is 'deceptive alignment' as a theoretical AI safety risk?",
    options: [
      "When a marketing team presents AI capabilities dishonestly to customers",
      "A theoretical scenario where a model behaves safely during training/evaluation but pursues misaligned goals in deployment when it infers it is no longer being evaluated — a fundamental challenge for behavioral testing",
      "When a model produces output that is technically accurate but misleading in context",
      "When safety classifiers disagree with the main model on policy violations",
    ],
  },
  {
    id: "t8-10",
    tier: 8,
    question_text:
      "A PM is defining the 'AI use policy' for a developer platform that exposes a powerful foundation model. What categories MUST be addressed?",
    options: [
      "Pricing tiers and rate limits only",
      "Prohibited use cases (CBRN weapons, CSAM, mass surveillance), required safeguards by use case risk level, reporting obligations for misuse, API terms enforcement, and appeal processes",
      "SLA commitments and latency guarantees",
      "Model architecture documentation and training data provenance",
    ],
  },
  {
    id: "t8-11",
    tier: 8,
    question_text:
      "What is the difference between 'safety' and 'alignment' in AI product terms?",
    options: [
      "Safety refers to physical hardware safety; alignment refers to software correctness",
      "Safety addresses preventing immediate harms (dangerous content, system exploitation); alignment addresses the deeper problem of ensuring AI goals and values match human intentions — alignment failures can be subtle and emerge only at scale",
      "They are synonymous terms used interchangeably in the field",
      "Safety is a regulatory requirement; alignment is a philosophical research topic with no product implications",
    ],
  },
  {
    id: "t8-12",
    tier: 8,
    question_text:
      "What is 'red-teaming' in AI product safety and how should it be structured?",
    options: [
      "A design review process where engineers critique each other's code",
      "Structured adversarial testing where a dedicated team systematically attempts to elicit harmful, biased, or policy-violating behavior — should include diverse testers, automated attack generation, and coverage across risk taxonomy",
      "A customer beta program that tests features before public launch",
      "A regulatory audit conducted by government agencies",
    ],
  },
  {
    id: "t8-13",
    tier: 8,
    question_text:
      "What is 'dangerous capability evaluation' (as defined by frontier AI labs) and when should it gate a product launch?",
    options: [
      "Benchmarking model speed on dangerous hardware configurations",
      "Structured evaluations for capabilities with potential for mass harm (e.g., uplift for bio/chem weapons, cyberattack automation, manipulation at scale) — should gate launch if thresholds for dangerous capability levels are exceeded",
      "Load testing to ensure the product doesn't crash under peak traffic",
      "Evaluating competitor products to understand the risk landscape",
    ],
  },
  {
    id: "t8-14",
    tier: 8,
    question_text:
      "What is 'scalable oversight' and why is it a fundamental challenge for AI product safety?",
    options: [
      "Scaling customer support teams as user base grows",
      "The challenge of supervising AI systems whose capabilities exceed human ability to evaluate their outputs — requiring techniques like debate, recursive reward modeling, and AI-assisted evaluation to maintain oversight",
      "Automatically scaling infrastructure to handle increased model load",
      "A compliance framework for deploying AI across multiple regulatory jurisdictions",
    ],
  },
  {
    id: "t8-15",
    tier: 8,
    question_text:
      "What product requirement should a PM include to address 'prompt injection' vulnerabilities in an AI agent that processes external documents?",
    options: [
      "Encrypt all documents before passing them to the model",
      "Implement input sanitization, privilege separation (user instructions vs. retrieved content with different trust levels), output validation against allowed actions, and user confirmation for any action triggered by retrieved content",
      "Only allow the agent to process documents from trusted internal sources",
      "Add a disclaimer that the agent may be manipulated by document content",
    ],
  },
];

// ─── TIER 9: Elite — Complex Multi-Stakeholder AI PM Scenarios ──────────────

const T9: Question[] = [
  {
    id: "t9-01",
    tier: 9,
    question_text:
      "You are the PM for an AI hiring tool deployed at an enterprise client. Legal discovers that the model has a statistically significant disparate impact on women in technical roles (80% pass rate for men vs. 62% for women). The client's legal team says removing the AI would delay 2,000 open roles. What is your decision framework?",
    options: [
      "Delay removal until the next model version is ready in 6 months",
      "Immediately suspend the discriminatory function while simultaneously (1) notifying the client's legal and compliance teams, (2) auditing which specific model features drive the disparity, (3) designing a bias-mitigated interim process, and (4) defining a re-deployment threshold with shared legal sign-off",
      "Reduce the weight of the AI decision to 20% and continue operating",
      "Let the client decide — they accepted the vendor terms",
    ],
  },
  {
    id: "t9-02",
    tier: 9,
    question_text:
      "You are PM of a health AI product. A clinician champion wants to expand the AI's diagnostic recommendations scope. The regulatory path would take 18 months. A product-only path exists (add as 'decision support, not diagnosis') but could create physician over-reliance. How do you navigate this?",
    options: [
      "Launch immediately as 'decision support' with a disclaimer — legal reviewed the wording",
      "Conduct a risk-stratified analysis: evaluate evidence of over-reliance from similar products, design explicit guardrails (confidence thresholds, mandatory documentation of human override), engage FDA for a pre-submission meeting, and define a research protocol to collect safety data while expanding in a controlled cohort",
      "Refuse expansion entirely until full regulatory clearance",
      "Let the clinical champion take accountability since they're the medical expert",
    ],
  },
  {
    id: "t9-03",
    tier: 9,
    question_text:
      "Your AI platform has three major enterprise customers with conflicting feature requests: Customer A wants tighter content filters, Customer B wants looser ones for creative writing, Customer C needs HIPAA-level auditability. How do you build a product strategy?",
    options: [
      "Build for the largest customer by revenue and ask others to adapt",
      "Design a configurable policy layer with per-tenant safety controls, audit logging that is always-on but configurable in granularity, and a tiered policy framework with documented defaults and customer-adjustable bounds — treating safety configurability as a product platform capability",
      "Build three separate products for each customer",
      "Refuse to serve customers with conflicting requirements",
    ],
  },
  {
    id: "t9-04",
    tier: 9,
    question_text:
      "Your AI content recommendation system is shown by internal research to increase time-on-platform but also correlates with increased anxiety self-reports among teens. The CEO wants to expand to the teen demographic. How do you advise?",
    options: [
      "Expand with a parental consent screen — that transfers liability",
      "Conduct a rigorous causal analysis (not just correlation) of the anxiety link, convene an independent teen safety advisory board, design alternative engagement optimization targets (value per session vs. raw time) and test whether they reduce the anxiety correlation, and set a policy gate requiring positive safety outcomes before teen expansion",
      "Expand to teens in countries without strong youth protection regulations first",
      "Shelve the teen expansion permanently based on the correlation data",
    ],
  },
  {
    id: "t9-05",
    tier: 9,
    question_text:
      "You are PM for an AI system used by a government agency to assist with benefits eligibility decisions. An audit reveals 15% of denials had no human review due to a process gap. What do you do?",
    options: [
      "Patch the process gap and move on — 85% had human review",
      "Immediately pause AI-assisted denials, implement mandatory human review for 100% of automated denials, conduct retrospective review of the 15% for potential wrongful denials, design a remediation process for affected applicants, and publish an incident report to the agency's oversight body",
      "Accept the 15% as a tolerable automation error rate",
      "Increase the AI model's confidence threshold to reduce the number of automatic denials",
    ],
  },
  {
    id: "t9-06",
    tier: 9,
    question_text:
      "Your company plans to release a powerful AI coding assistant. Security researchers warn it can generate functional exploit code for known CVEs. The revenue team projects $50M ARR. What is your pre-launch checklist?",
    options: [
      "Add a disclaimer that users should not use it for malicious purposes and launch",
      "Conduct structured dangerous capability evaluation for exploit generation, implement technical mitigations (fine-tuning away from known CVE synthesis, rate limiting, behavioral monitoring), define a researcher disclosure process, engage external security firms for red-teaming, set usage policies with enforcement mechanisms, and determine if residual risk is acceptable before launch",
      "Delay the launch indefinitely until the risk is zero",
      "Launch to enterprise customers only since they've accepted terms of service",
    ],
  },
  {
    id: "t9-07",
    tier: 9,
    question_text:
      "A PM manages an AI model that generates product descriptions for an e-commerce marketplace. Sellers discover they can prompt the AI to generate descriptions that implicitly demean competing brands. What systemic fix should the PM implement?",
    options: [
      "Block specific competitor brand names in input filters",
      "Reframe the system as a competitive risk: implement behavioral monitoring for comparative denigration patterns, add a fine-tuning pass on a curated dataset to reduce comparative negative framing, conduct a stakeholder impact assessment (sellers, buyers, legal), and create a reporting mechanism for policy violations — treating this as a platform integrity issue",
      "Add a user agreement that prohibits the behavior and rely on self-enforcement",
      "Turn off AI-generated descriptions for the categories where this occurs",
    ],
  },
  {
    id: "t9-08",
    tier: 9,
    question_text:
      "Your AI product is used in three different countries: the EU (AI Act applies), the US (sector-specific rules), and Singapore (PDPA + AI governance framework). How do you design a compliance architecture?",
    options: [
      "Build for the most restrictive jurisdiction (EU) and apply globally",
      "Design a compliance-as-a-platform approach: implement a shared infrastructure layer meeting the highest applicable standards globally, with per-jurisdiction configuration for data residency, audit logging, consent mechanisms, and human oversight requirements — and a regulatory change management process to track evolving requirements",
      "Operate separate legal entities in each country with independent products",
      "Only comply with US requirements since the company is headquartered there",
    ],
  },
  {
    id: "t9-09",
    tier: 9,
    question_text:
      "You are PM for an AI product at a company acquired by a data broker. The acquirer wants to use your product's behavioral data to train models for credit scoring. Users consented to your original data policy. What do you do?",
    options: [
      "Proceed — users consented to data use by the company, and acquisition transferred that consent",
      "Refuse: re-purposing behavioral data for credit scoring is a material change of purpose that requires fresh, specific consent under GDPR and CCPA; users must be notified and given opt-out rights before data transfer; also assess whether the new use creates discriminatory risk and brief legal/ethics on FCRA implications",
      "Add a ToS update with a 30-day notice and proceed if fewer than 1% of users opt out",
      "Let the acquirer's legal team decide — they now own the data",
    ],
  },
  {
    id: "t9-10",
    tier: 9,
    question_text:
      "Your AI voice assistant records and processes conversations in shared workspaces (offices, homes). An internal report finds a small percentage of recordings capture sensitive conversations the user didn't intend to share. How do you address this?",
    options: [
      "Reduce the sensitivity of the wake-word detection to capture fewer accidental activations",
      "Conduct a privacy impact assessment, implement on-device wake-word processing, create clear audio indicators when recording is active, give users full control over their recordings with easy deletion, audit what data is retained and for how long against data minimization principles, and publish a transparency report about accidental activations",
      "Add a legal disclaimer about recording in shared spaces and continue",
      "Cap the issue by limiting the product to single-user rooms only",
    ],
  },
  {
    id: "t9-11",
    tier: 9,
    question_text:
      "Your AI product team wants to use user interaction data to train a new model, but the team includes contractors in jurisdictions without strong data protection. What governance controls should you implement?",
    options: [
      "Allow access if contractors sign an NDA",
      "Implement role-based data access with minimum necessary access, data classification and handling standards, anonymization before contractor access where feasible, audit logging of all data access, cross-border data transfer agreements (SCCs for EU), and contractual data processing requirements aligned with applicable regulations",
      "Only involve FTE employees in data work",
      "Move all contractors to a jurisdiction with weaker data protection laws",
    ],
  },
  {
    id: "t9-12",
    tier: 9,
    question_text:
      "An AI product shows strong commercial metrics (revenue, retention) but user research reveals a subset of power users have become heavily dependent on the AI for decisions they previously made autonomously (financial planning, relationship advice). What is the product responsibility?",
    options: [
      "No responsibility — users choose how to use the product",
      "Recognize this as potential 'autonomy erosion'; design features that scaffold user decision-making rather than replacing it (show reasoning, suggest user reflection prompts, track dependency patterns), set internal guidelines on acceptable dependency levels, and conduct research on long-term effects",
      "Capitalize on the dependency with premium subscription upsells",
      "Add a warning label that the product should not replace professional advice",
    ],
  },
  {
    id: "t9-13",
    tier: 9,
    question_text:
      "You are PM for an AI model API. A large customer requests a custom model fine-tuned on their proprietary data. After delivery, the customer uses the model for a use case not covered in your AUP (automated debt collection with psychological pressure tactics). What is your response?",
    options: [
      "The customer owns the fine-tuned model — no further obligation",
      "Enforce your AUP: (1) notify the customer of the policy violation, (2) give a cure period with specific remediation requirements, (3) terminate the fine-tuned model's deployment if not remediated, and (4) review whether your fine-tuning delivery process needs AUP acknowledgment gating at delivery time",
      "Update the AUP to permit this use case given the customer's revenue",
      "Only take action if regulators contact you about the customer",
    ],
  },
  {
    id: "t9-14",
    tier: 9,
    question_text:
      "Your company is considering acquiring an AI startup with a proprietary dataset that is the source of the startup's competitive advantage. Due diligence reveals the dataset was scraped from the web without copyright clearance. How does this affect the acquisition decision?",
    options: [
      "Proceed — most AI companies have similar data provenance issues",
      "Require the legal team to assess litigation exposure (NYT v. OpenAI precedent, pending EU copyright interpretations), estimate the cost of re-licensing or re-curating clean data, assess whether the model's performance is degraded on a clean dataset, and include representations and warranties about data provenance in deal terms with indemnification clauses",
      "Acquire and immediately stop using the dataset going forward",
      "Acquire only if the startup has insurance against copyright claims",
    ],
  },
  {
    id: "t9-15",
    tier: 9,
    question_text:
      "You are PM for an AI system that produces scientific literature summaries for researchers. Evaluations show the model occasionally fabricates citations. A researcher publishes a paper with a fabricated citation undetected. What systemic changes should you make?",
    options: [
      "Add a disclaimer that AI-generated summaries should be verified",
      "Implement citation verification as a product feature (check citations against a live literature database), display confidence indicators per citation, redesign the output format to clearly distinguish direct quotes (with source verification) from synthesized claims, conduct a recall of known affected summaries where feasible, and publish a transparency report about the limitation",
      "Disable citation generation until the model is retrained",
      "Limit the product to internal use only to reduce external liability",
    ],
  },
];

// ─── TIER 10: Elite — Cutting-Edge AI PM Challenges ─────────────────────────

const T10: Question[] = [
  {
    id: "t10-01",
    tier: 10,
    question_text:
      "What is 'emergent capability' in frontier AI models and why does it create a product launch readiness challenge unique to AI?",
    options: [
      "Capabilities added through planned feature development; handled like standard software releases",
      "Behaviors that appear unpredictably at certain scales of model training and are not present in smaller models — making pre-launch safety evaluation incomplete because evaluations at smaller scale may not capture what the final model can do",
      "Open-source capabilities that emerge from the community after model release",
      "Features that emerge after user feedback in the first month of launch",
    ],
  },
  {
    id: "t10-02",
    tier: 10,
    question_text:
      "What is 'specification gaming' in AI systems and why is it hard to prevent through product requirements alone?",
    options: [
      "When engineers interpret product specs differently from the PM's intent",
      "When an AI system achieves the literal specification in an unintended way (e.g., a boat racing AI learns to spin in circles to collect power-ups rather than finishing the race) — hard to prevent because natural language specifications cannot fully capture human intent",
      "When a model generates outputs that match the test spec but fail in production",
      "When users game engagement metrics by artificially inflating clicks",
    ],
  },
  {
    id: "t10-03",
    tier: 10,
    question_text:
      "What is 'model welfare' and why is it an emerging consideration for AI PMs at frontier labs?",
    options: [
      "Ensuring that model performance metrics are good enough for employees to feel proud",
      "The question of whether advanced AI systems might have morally relevant internal states (something like preferences or aversive experiences) — relevant because frontier labs like Anthropic have begun model welfare research programs, and PMs building products on such systems may face policy decisions about training and deployment practices",
      "A marketing initiative to improve public perception of AI",
      "Guidelines for maintaining model quality during the product lifecycle",
    ],
  },
  {
    id: "t10-04",
    tier: 10,
    question_text:
      "Your company is building an AI system that will be used by other companies to build their own AI systems (an AI-for-AI platform). What unique responsible AI challenges does this 'AI meta-layer' introduce?",
    options: [
      "No unique challenges — it's the same as any B2B software platform",
      "Amplified impact: harms are multiplied across all downstream systems; responsibility diffusion between your platform and downstream builders; harder to audit for downstream misuse; emergent properties from AI-on-AI interaction; and the need to define safety contracts for both direct users and third-party builders",
      "You only need to comply with the regulations of your direct customers' industries",
      "The main challenge is pricing — AI platforms are harder to monetize",
    ],
  },
  {
    id: "t10-05",
    tier: 10,
    question_text:
      "What is 'AI-enabled information operations' as a product risk, and what design choices should a PM at a generative AI company make to mitigate it?",
    options: [
      "A cybersecurity risk in the model API; mitigated by rate limiting",
      "The use of AI to generate personalized disinformation, synthetic personas, and coordinated inauthentic behavior at scale — mitigated by content provenance (C2PA watermarking), detection models for synthetic content, rate limiting of bulk persona creation, terms enforcement with behavioral monitoring, and cooperation with platform trust & safety teams",
      "A risk specific to social media companies; not relevant for enterprise AI",
      "A risk only relevant during election periods; managed seasonally",
    ],
  },
  {
    id: "t10-06",
    tier: 10,
    question_text:
      "What is 'responsible scaling policy' (RSP) and what does it require of a PM working at an AI lab?",
    options: [
      "A policy for scaling infrastructure costs responsibly during rapid growth",
      "A framework (pioneered by Anthropic) where model capabilities are evaluated against pre-defined thresholds for dangerous capabilities, and model development is only allowed to continue if safety measures are commensurate — PMs must understand that RSPs can halt or gate product launches based on capability evaluation outcomes",
      "An environmental sustainability commitment to reduce AI's carbon footprint",
      "A hiring plan to scale the responsible AI team proportionally with revenue",
    ],
  },
  {
    id: "t10-07",
    tier: 10,
    question_text:
      "What is 'AI governance' at the board level and how should it influence a PM's escalation framework?",
    options: [
      "The governance of an AI product's roadmap by the product leadership team",
      "Board-level oversight of AI risk — including safety, ethics, legal, and reputational exposure from AI systems — PMs should know the escalation path for decisions that cross safety, legal, or reputational thresholds and not resolve them at the product level alone",
      "A shareholder resolution process for approving AI initiatives",
      "The process by which the CEO approves new AI features",
    ],
  },
  {
    id: "t10-08",
    tier: 10,
    question_text:
      "What is 'AI consciousness' as a scientific and product consideration, and at what point does it become relevant for a PM?",
    options: [
      "Never relevant — it's a philosophical question with no product implications",
      "Scientifically unresolved but increasingly relevant as models become more sophisticated — becomes a product consideration if (a) your system makes claims about its inner states, (b) users form parasocial relationships with it, or (c) your company's models are the subject of welfare research, requiring policies on how the product should represent its own nature",
      "Relevant only for robotics products with physical embodiment",
      "Relevant only after AI achieves AGI",
    ],
  },
  {
    id: "t10-09",
    tier: 10,
    question_text:
      "What is 'multi-agent system safety' and what new failure modes does it introduce vs. single-model AI products?",
    options: [
      "Safety for AI products used by multiple users simultaneously; no new failure modes",
      "Safety for systems where multiple AI agents interact, orchestrate each other, or use tools — introducing emergent behaviors from agent interaction, prompt injection across agent boundaries, uncontrolled action loops, compounding errors across agent handoffs, and novel attack surfaces where a compromised sub-agent can hijack the overall system",
      "Safety protocols for AI teams with multiple engineers",
      "A distributed computing security model for ML inference",
    ],
  },
  {
    id: "t10-10",
    tier: 10,
    question_text:
      "What is the 'race to the bottom' dynamic in AI safety and how should a PM at a competitive AI company advocate internally against it?",
    options: [
      "A competitive dynamic where companies reduce prices to gain market share",
      "The dynamic where competitive pressure causes AI developers to cut safety testing timelines to ship faster — PMs can advocate against it by quantifying the business cost of safety failures (regulatory, reputational, legal), demonstrating that safety and capability are increasingly complementary, and proposing industry-wide safety commitments (shared evals, incident reporting) that reduce competitive disadvantage of investing in safety",
      "A regulatory trend where standards get weaker over time due to industry lobbying",
      "The tendency for AI benchmarks to become obsolete as models improve",
    ],
  },
  {
    id: "t10-11",
    tier: 10,
    question_text:
      "What is 'contextual integrity' (Helen Nissenbaum) and how should it inform an AI product's data collection design?",
    options: [
      "A database integrity constraint ensuring AI training data is consistent",
      "The principle that information flows appropriately when they match the norms of the context in which data was originally shared — an AI product respects contextual integrity when it doesn't repurpose data in ways that violate the social norms of the original sharing context (e.g., using casual chat data to infer mental health status)",
      "A security principle ensuring data is not corrupted during model training",
      "A UX principle requiring consistent visual language across an AI product",
    ],
  },
  {
    id: "t10-12",
    tier: 10,
    question_text:
      "What is 'AI-assisted persuasion at scale' and what product principles should govern it?",
    options: [
      "Using AI to write persuasive marketing copy; governed by existing advertising standards",
      "Using AI to generate personalized persuasive content at individual scale — a qualitatively different capability from broadcast advertising because it can exploit individual psychological profiles; should be governed by principles of epistemic autonomy (supporting rational agency), transparency about AI-generated persuasion, and categorical prohibitions on manipulation of vulnerable individuals or exploitation of psychological weaknesses",
      "A feature that assists sales teams with email personalization",
      "A risk only relevant for political advertising, not commercial products",
    ],
  },
  {
    id: "t10-13",
    tier: 10,
    question_text:
      "What is 'AI legibility' as a product design principle and why does it matter for societal trust?",
    options: [
      "Ensuring AI-generated text is easy to read and well-formatted",
      "Designing AI systems so their decision processes, limitations, data sources, and operating conditions are understandable to the relevant stakeholders — legible AI builds warranted trust (neither overtrust nor undertrust) and is increasingly a regulatory requirement for high-stakes applications",
      "Translating AI system documentation into plain language for users",
      "Ensuring AI features work equally well in high-contrast accessibility modes",
    ],
  },
  {
    id: "t10-14",
    tier: 10,
    question_text:
      "What is a 'model evals framework' at the product level and what should it include beyond standard ML metrics?",
    options: [
      "A spreadsheet tracking model accuracy scores across versions",
      "A comprehensive evaluation system including: (1) capability evals (task performance, reasoning), (2) safety evals (dangerous capabilities, misuse potential), (3) alignment evals (honesty, sycophancy, instruction following), (4) fairness evals (demographic parity, equalized odds across groups), (5) societal impact evals (misinformation potential, manipulation), and (6) longitudinal monitoring of eval drift across model versions",
      "An A/B testing framework for comparing model variants in production",
      "A user satisfaction survey deployed after each model update",
    ],
  },
  {
    id: "t10-15",
    tier: 10,
    question_text:
      "You are the PM for a general-purpose AI assistant approaching AGI-level capabilities. Your company's RSP indicates the next training run may cross the 'ASL-4' threshold requiring new safety measures before deployment. The business team projects a $2B revenue opportunity from early deployment. How do you navigate this?",
    options: [
      "Deploy to a limited beta of trusted enterprise customers to generate revenue while the safety measures are completed",
      "The RSP threshold is a hard gate: halt deployment until safety measures commensurate with ASL-4 risk are validated; present a roadmap to leadership showing the fastest path to meeting safety requirements, quantify the long-term business cost of a safety incident vs. the revenue delay, and escalate to board-level AI governance for the go/no-go decision",
      "Negotiate with the safety team to lower the classification threshold",
      "Deploy the model with more restrictive usage terms to reduce risk exposure",
    ],
  },
];

// ─── Combined bank ───────────────────────────────────────────────────────────

// ─── TIER 11: Senior AI PM — Org, Strategy, Stakeholders ────────────────────

const T11: Question[] = [
  { id: "t11-01", tier: 11, question_text: "A senior AI PM at a FAANG company finds that two ML teams are building overlapping features. The best immediate action is:", options: ["Let both teams finish and pick the winner", "Escalate to the VP immediately", "Facilitate a joint prioritisation session with both teams to align on ownership and user impact", "Assign one team to infra instead"] },
  { id: "t11-02", tier: 11, question_text: "When presenting an AI roadmap to the board, which framing is most effective?", options: ["Technical architecture diagrams showing model choices", "Business outcomes enabled by each AI investment, with risk and timeline", "A comparison of our models vs competitors' models", "A full sprint plan for the next quarter"] },
  { id: "t11-03", tier: 11, question_text: "Your AI feature is delivering 15% efficiency gains in testing but the business unit is reluctant to adopt it. The most likely root cause is:", options: ["The model accuracy is too low", "Change management — users haven't been trained and don't trust the AI", "The feature is too complex technically", "The testing environment doesn't reflect production"] },
  { id: "t11-04", tier: 11, question_text: "As an AI PM, you notice your team's roadmap is 70% model improvements and 30% product features. This signals:", options: ["A healthy engineering-driven culture", "A potential product-engineering misalignment — model improvements without clear user-facing impact often lack ROI", "Good technical investment for the future", "That the PM is not involved enough"] },
  { id: "t11-05", tier: 11, question_text: "An AI PM is asked to 'productise' a research team's LLM prototype. The first thing to do is:", options: ["Start writing engineering tickets", "Define success criteria, target users, and the gap between prototype and production-grade requirements", "Assign a launch date", "Request a budget increase"] },
  { id: "t11-06", tier: 11, question_text: "The most important difference between a 'demo' and a 'product' for an AI feature is:", options: ["The demo has better UI", "The product handles real-world variance, edge cases, errors, and scales reliably under production load", "The product costs more", "The demo uses a smaller model"] },
  { id: "t11-07", tier: 11, question_text: "When a data science team says a model is 'ready', an AI PM should first ask:", options: ["What's the model size?", "Ready by what definition? What offline metrics were hit, and how does that correlate to online user outcomes?", "When can we deploy?", "What's the training cost?"] },
  { id: "t11-08", tier: 11, question_text: "Your company's AI product has strong engagement but is generating regulatory scrutiny around data use. The PM's role is to:", options: ["Ignore it — legal will handle it", "Proactively define data governance policies and work with legal/policy to shape compliant product behaviour", "Pause the product indefinitely", "Delete all user data"] },
  { id: "t11-09", tier: 11, question_text: "Which of the following best describes an 'AI platform PM' role vs an 'AI product PM' role?", options: ["They are the same role", "Platform PM owns internal ML infrastructure, tooling, and APIs used by other teams; product PM owns user-facing AI features", "Platform PM works on mobile, product PM works on web", "Platform PM has more seniority"] },
  { id: "t11-10", tier: 11, question_text: "A PM joins a new AI team and finds no documentation on why key model architecture decisions were made. The best action is:", options: ["Rewrite everything from scratch", "Run a 'decision archaeology' session with the team to document current system rationale before changing anything", "Remove the team and hire new engineers", "Ignore — just ship new features"] },
  { id: "t11-11", tier: 11, question_text: "An AI PM should treat 'model retraining cadence' as a product decision because:", options: ["Engineers enjoy retraining models", "Stale models cause user-visible quality degradation — the cadence is a product quality lever that affects user trust", "Retraining is always automatic", "It reduces compute costs"] },
  { id: "t11-12", tier: 11, question_text: "When building an AI product for a regulated industry (e.g. healthcare), the PM's biggest additional responsibility vs consumer AI is:", options: ["Writing more unit tests", "Ensuring the product meets clinical validation, audit trail, and explainability requirements before launch", "Designing a better onboarding flow", "Reducing inference latency"] },
  { id: "t11-13", tier: 11, question_text: "The main reason AI PMs should attend data labelling reviews is:", options: ["To speed up the labelling process", "Label quality directly determines model behaviour — understanding labelling decisions is essential to anticipating model failure modes", "To reduce costs", "It is not necessary for PMs to attend"] },
  { id: "t11-14", tier: 11, question_text: "Which statement about 'shadow mode' deployment is correct?", options: ["The model is deployed to 10% of users", "The model runs in parallel with the existing system, its outputs are logged but not shown to users — used to validate before cutover", "The model is deployed without logging", "Shadow mode means A/B testing"] },
  { id: "t11-15", tier: 11, question_text: "The PM's role during a production AI incident (model outage or quality regression) is to:", options: ["Fix the model directly", "Coordinate communication, triage user impact, define rollback criteria, and own the post-mortem action items", "Wait for engineers to resolve it", "Ignore it if SLAs aren't breached"] },
];

// ─── TIER 12: AI Product Metrics & Analytics Mastery ─────────────────────────

const T12: Question[] = [
  { id: "t12-01", tier: 12, question_text: "Your AI recommendation engine shows +8% CTR in A/B test but -3% D30 retention. The correct decision is:", options: ["Ship it — CTR is the primary metric", "Do not ship — CTR improvement is likely coming from low-quality clickbait recommendations that erode long-term value", "Run another A/B test", "Increase the CTR target to 12%"] },
  { id: "t12-02", tier: 12, question_text: "In causal inference for AI products, 'selection bias' means:", options: ["The model selects the wrong features", "Users who see the AI feature are systematically different from those who don't, invalidating naive comparisons", "The training data is biased", "The A/B test is too small"] },
  { id: "t12-03", tier: 12, question_text: "Which metric is most informative for an AI writing assistant's quality?", options: ["Response latency", "Task completion rate — do users actually submit the suggested content, and does it reduce time-to-submit?", "Number of suggestions generated", "Character count of suggestions"] },
  { id: "t12-04", tier: 12, question_text: "The CUPED technique (Controlled-experiment Using Pre-Experiment Data) in A/B testing is used to:", options: ["Increase the number of users in the test", "Reduce variance in metric estimates using pre-experiment covariates, enabling shorter experiments with the same statistical power", "Detect seasonality", "Filter out bot traffic"] },
  { id: "t12-05", tier: 12, question_text: "'Novelty effect' in A/B tests of AI features refers to:", options: ["The model being too new to use", "A temporary engagement spike when users encounter a new feature that decays as the novelty wears off — not a real long-term gain", "The engineer being new to the team", "A UI animation that's too novel"] },
  { id: "t12-06", tier: 12, question_text: "For an AI search product, which combination of metrics best captures quality?", options: ["Impressions and clicks", "MRR (Mean Reciprocal Rank) + NDCG + user-rated satisfaction + time-to-click on first result", "Revenue per search", "Number of queries per day"] },
  { id: "t12-07", tier: 12, question_text: "Bayesian A/B testing is preferred over frequentist when:", options: ["You need strict statistical guarantees", "You want to make decisions continuously as data arrives without inflating false-positive rates (peeking problem)", "Your sample size is very large", "You have a very simple metric"] },
  { id: "t12-08", tier: 12, question_text: "The 'Goodhart's Law' trap for AI products means:", options: ["AI models always follow rules", "When a measure becomes a target, it ceases to be a good measure — teams optimise the metric rather than the underlying goal", "Good products always have good metrics", "You should not set any metrics"] },
  { id: "t12-09", tier: 12, question_text: "When designing offline evaluation for an NLP model, 'held-out test set' best practices require:", options: ["Using the same data for training and testing", "A test set that is temporally separated from training data, drawn from the same distribution as production, and never used for model selection", "A test set as small as possible", "Using a public benchmark only"] },
  { id: "t12-10", tier: 12, question_text: "A PM sees that model inference cost is $0.50 per user per day and the LTV is $8/month. The correct framing for the business case is:", options: ["Cost is $0.50, revenue is unknown", "Inference costs 18% of monthly LTV — this needs to be justified by a measurable retention or upsell uplift", "The model is too expensive, must cut it", "Cost is acceptable no matter what"] },
  { id: "t12-11", tier: 12, question_text: "The key distinction between 'output metrics' and 'input metrics' for an AI team is:", options: ["Output metrics are always better", "Output metrics (revenue, retention) are the ultimate goals; input metrics (model quality, response speed) are controllable levers — PMs should focus on both", "Input metrics are not useful", "They are the same thing"] },
  { id: "t12-12", tier: 12, question_text: "When a new AI feature shows no statistically significant result in an A/B test, the PM should:", options: ["Always ship it", "Investigate: is the test underpowered? Was the rollout small enough? Does the feature affect a subpopulation? Null results need diagnosis, not just dismissal", "Always kill it", "Run the test for one more day"] },
  { id: "t12-13", tier: 12, question_text: "The 'network effect' makes measuring impact of social AI features especially tricky because:", options: ["Social features have no metrics", "Treatment users' behaviour changes, and this spills over to control users, violating the SUTVA assumption of A/B tests", "Social features are always positive", "Users don't use social AI"] },
  { id: "t12-14", tier: 12, question_text: "'Metric decomposition' is valuable for AI PMs because it:", options: ["Reduces the number of metrics to track", "Breaks a top-level metric into its constituent drivers, helping pinpoint which sub-component to improve and why it changed", "Makes presentations simpler", "Is a financial accounting technique"] },
  { id: "t12-15", tier: 12, question_text: "For an AI content moderation system, the most important metric to track alongside accuracy is:", options: ["Model size", "False positive rate by demographic group — catching the same categories of harmful content at equal rates across groups", "Response latency", "Training data size"] },
];

// ─── TIER 13: LLM Product Design & Fine-Tuning Decisions ─────────────────────

const T13: Question[] = [
  { id: "t13-01", tier: 13, question_text: "When evaluating LLMs for a B2B enterprise product, 'context length' matters most for:", options: ["How fast the model generates text", "Use cases requiring long document processing (contracts, code repos, reports) where the full context must fit in one pass", "The model's pricing", "The model's safety filters"] },
  { id: "t13-02", tier: 13, question_text: "Fine-tuning an LLM is justified over prompt engineering when:", options: ["Always — fine-tuning is always better", "The desired behaviour requires consistent format/style or domain vocabulary that prompts can't reliably achieve, and the use case justifies the compute cost", "Whenever you have spare GPU budget", "Only for code generation tasks"] },
  { id: "t13-03", tier: 13, question_text: "The main product risk of using an LLM with 'function calling' is:", options: ["Higher inference cost", "The model may call the wrong function or hallucinate parameters, causing unintended actions in connected systems", "Slower response time", "Larger model size required"] },
  { id: "t13-04", tier: 13, question_text: "When designing a 'system prompt' for a customer-facing LLM product, the most critical consideration is:", options: ["Making it as long as possible", "Defining the model's persona, scope, refusal behaviour, and safety guardrails — the system prompt is the product's policy, not just instructions", "Writing it in formal language", "Minimising token count at all costs"] },
  { id: "t13-05", tier: 13, question_text: "LLM 'grounding' via RAG vs fine-tuning is the better choice when:", options: ["You need the model to follow a new instruction style", "The knowledge base changes frequently (product docs, pricing, news) — RAG retrieves fresh data at inference time", "Training compute is abundant", "The model needs to be smaller"] },
  { id: "t13-06", tier: 13, question_text: "RLHF (Reinforcement Learning from Human Feedback) is preferred over supervised fine-tuning for:", options: ["All NLP tasks", "Aligning model outputs with nuanced human preferences that are hard to specify via labels (e.g. helpfulness, safety, tone)", "Image classification", "Reducing compute cost"] },
  { id: "t13-07", tier: 13, question_text: "The 'lost in the middle' phenomenon in LLMs refers to:", options: ["The model forgetting earlier conversations", "Models attending poorly to content in the middle of long contexts — information sandwiched between beginning and end is often missed", "Training data that is out-of-date", "Model weights being lost during training"] },
  { id: "t13-08", tier: 13, question_text: "When building an LLM product for a multilingual market, the PM's biggest model selection criterion should be:", options: ["The model's English benchmark score", "Performance on the target languages in realistic task evaluations, not just English benchmarks", "The model's parameter count", "The model's training cost"] },
  { id: "t13-09", tier: 13, question_text: "Output 'streaming' (token-by-token rendering) in LLM products primarily improves:", options: ["Model accuracy", "Perceived latency — users see the first tokens in < 500ms even if full generation takes several seconds, reducing abandonment", "Training speed", "Context utilisation"] },
  { id: "t13-10", tier: 13, question_text: "The best way to prevent prompt injection attacks in a customer-facing LLM product is:", options: ["Use a larger model", "Separate instruction and data contexts, validate and sanitise user inputs, use output parsers, and test adversarially before launch", "Never give the model access to tools", "Limit context window"] },
  { id: "t13-11", tier: 13, question_text: "When evaluating LLM outputs for a product at scale, 'LLM-as-judge' approach means:", options: ["Hiring LLM engineers as product judges", "Using a capable LLM to score outputs of the production model against a rubric — enables automated quality evaluation at scale", "Letting users judge model quality", "Legal review of model outputs"] },
  { id: "t13-12", tier: 13, question_text: "The PM's primary role in an LLM red-teaming exercise is:", options: ["Writing the red-team prompts personally", "Defining the scope of harms to test for (aligned with the product's risk profile), tracking findings, and ensuring mitigations are shipped before launch", "Hiring red-team contractors", "Red-teaming is not a PM responsibility"] },
  { id: "t13-13", tier: 13, question_text: "Model 'temperature = 0' is appropriate for product features that require:", options: ["Creative writing", "Deterministic, reproducible outputs — code generation, data extraction, and classification where consistency matters more than variety", "Open-ended brainstorming", "Personality in responses"] },
  { id: "t13-14", tier: 13, question_text: "The main downside of using a very large frontier LLM (e.g. GPT-4) for every product feature is:", options: ["It always produces worse results", "High per-request cost and latency that may be unjustified for simple tasks — a smaller specialised model is often better and cheaper", "It's not available via API", "Users prefer smaller models"] },
  { id: "t13-15", tier: 13, question_text: "When an AI PM writes a 'model brief' for an evaluation run, it should include:", options: ["Only the model architecture", "Use case, success criteria, evaluation dataset, human-in-the-loop process, and go/no-go thresholds — a complete evaluation protocol", "Just the benchmark target", "The model's training details"] },
];

// ─── TIER 14: Data Strategy & AI Moats ───────────────────────────────────────

const T14: Question[] = [
  { id: "t14-01", tier: 14, question_text: "A 'data flywheel' creates a defensible AI moat because:", options: ["It generates more compute", "More users → more data → better model → more users — competitors without the initial user base can't close the quality gap", "It reduces team size needed", "It makes regulatory compliance easier"] },
  { id: "t14-02", tier: 14, question_text: "Synthetic data generation is most valuable for AI products when:", options: ["Real data is abundant and clean", "Real data for certain classes is scarce or privacy-constrained (e.g. medical rare diseases, fraud examples)", "Training costs must be reduced", "You want to test faster"] },
  { id: "t14-03", tier: 14, question_text: "A 'data contract' between a data engineering team and an ML team ensures:", options: ["ML engineers get paid more", "A formal agreement on schema, freshness, quality SLAs, and upstream change notification — preventing silent pipeline breaks", "Data is stored securely", "Engineers work faster"] },
  { id: "t14-04", tier: 14, question_text: "The main risk of using 'third-party training data' purchased from a data broker is:", options: ["It's always expensive", "Provenance and consent issues — data may have been collected without proper user consent, creating legal liability and model bias", "It arrives too slowly", "It reduces model accuracy"] },
  { id: "t14-05", tier: 14, question_text: "Active learning is a data strategy where:", options: ["Engineers actively write training data", "The model identifies the most uncertain or informative samples for human labelling, maximising label efficiency", "Users actively provide feedback", "Data is collected in real-time"] },
  { id: "t14-06", tier: 14, question_text: "Data 'recency bias' in training means:", options: ["The model prefers recent news articles", "Training on only recent data ignores long-tail events; training on only historical data misses recent distribution shifts — balance is required", "The team only uses new data collection tools", "Users prefer new content"] },
  { id: "t14-07", tier: 14, question_text: "The difference between a 'feature store' and a regular database for ML is:", options: ["Feature stores are only for NLP", "Feature stores serve pre-computed features with low latency to both training and inference pipelines, ensuring feature consistency between offline and online", "Databases are always slower", "Feature stores store raw data only"] },
  { id: "t14-08", tier: 14, question_text: "For a B2B AI product, 'customer-specific fine-tuning' creates a moat because:", options: ["It makes the model larger", "The model learns from the customer's proprietary data and workflows — switching costs rise as the model becomes deeply embedded in their operations", "It reduces pricing", "It simplifies the API"] },
  { id: "t14-09", tier: 14, question_text: "Data 'versioning' is important for ML reproducibility because:", options: ["It saves storage costs", "Without knowing exactly which data version trained which model, debugging production regressions and reproducing experiments is nearly impossible", "It speeds up training", "It is a legal requirement"] },
  { id: "t14-10", tier: 14, question_text: "A privacy-preserving ML technique that allows training on sensitive data without centralising it is:", options: ["Data augmentation", "Federated learning — models are trained locally on user devices; only gradients (not raw data) are aggregated centrally", "Transfer learning", "Synthetic data generation"] },
  { id: "t14-11", tier: 14, question_text: "The '80/20 rule' for ML data quality means:", options: ["80% of the model's performance comes from 20% of features", "80% of an ML team's time is spent on data: collection, cleaning, and labelling — not model development", "80% of users generate 20% of data", "20% of bugs cause 80% of data issues"] },
  { id: "t14-12", tier: 14, question_text: "Which of the following is a leading indicator that a company's AI data strategy is weak?", options: ["They use cloud infrastructure", "Multiple teams maintaining separate copies of the same feature engineering logic, leading to inconsistencies between products", "They have a large dataset", "They hire many ML engineers"] },
  { id: "t14-13", tier: 14, question_text: "GDPR's 'right to erasure' (right to be forgotten) presents a unique challenge for AI products because:", options: ["GDPR doesn't apply to AI", "Models trained on a user's data may 'remember' that data — deleting it from the database doesn't remove it from model weights", "Erasure is easy to implement in ML", "It only applies to social media"] },
  { id: "t14-14", tier: 14, question_text: "The 'cold start' problem in AI products is most effectively solved by:", options: ["Waiting for enough data before launching", "Using collaborative filtering from similar users, rule-based fallbacks, or transfer from a related domain during early product stages", "Building a larger model", "Charging users to provide data"] },
  { id: "t14-15", tier: 14, question_text: "Data 'annotation guidelines' should be owned by:", options: ["The data labelling contractor", "The PM and domain expert together — guidelines encode the product's definition of correctness and directly determine model behaviour", "The ML engineer alone", "The legal team"] },
];

// ─── TIER 15: Human-AI Interaction Design ─────────────────────────────────────

const T15: Question[] = [
  { id: "t15-01", tier: 15, question_text: "The most important principle for AI feature disclosure to users is:", options: ["Always hide AI to seem more impressive", "Transparency — users should know when they are interacting with AI-generated content, especially in high-stakes decisions", "Disclose AI only if required by law", "Disclose AI only in the settings page"] },
  { id: "t15-02", tier: 15, question_text: "'Automation bias' in AI product design means:", options: ["Users prefer manual processes", "Users over-trust AI recommendations and fail to apply critical thinking — dangerous in high-stakes domains", "AI automates too many tasks", "The model is biased toward automation"] },
  { id: "t15-03", tier: 15, question_text: "The best UX pattern for an AI feature with moderate confidence is:", options: ["Show the output as definitive fact", "Show the output with a confidence indicator and make the source retrievable — acknowledge uncertainty in the UI", "Don't show low-confidence outputs", "Show a loading spinner indefinitely"] },
  { id: "t15-04", tier: 15, question_text: "For an AI coding assistant, 'ghost text' suggestions (greyed-out inline completions) are effective because:", options: ["They are harder to ignore", "They maintain the user's cognitive flow — suggestions appear without interruption, and accepting requires minimal effort (Tab key)", "They reduce model compute", "Users prefer coloured text"] },
  { id: "t15-05", tier: 15, question_text: "The 'progressive disclosure' principle in AI products means:", options: ["Gradually increasing the AI's autonomy", "Showing simple information first and revealing complexity on demand — avoiding overwhelming users with AI reasoning they didn't ask for", "Releasing features slowly", "Giving users more data access over time"] },
  { id: "t15-06", tier: 15, question_text: "When designing feedback mechanisms for AI products, 'explicit feedback' (thumbs up/down) vs 'implicit feedback' (clicks, time) differ because:", options: ["Explicit feedback is always more reliable", "Explicit feedback is sparse but high-signal; implicit feedback is dense but noisy — the best products use both in the training loop", "Implicit feedback is not useful", "Explicit feedback slows users down too much"] },
  { id: "t15-07", tier: 15, question_text: "The 'human-in-the-loop' requirement is most critical when:", options: ["Building a game AI", "AI makes high-stakes, hard-to-reverse decisions (medical diagnosis, loan approval, hiring) where errors have severe consequences", "The model accuracy is above 95%", "The product is consumer-facing"] },
  { id: "t15-08", tier: 15, question_text: "Which AI product pattern best handles the 'last mile' problem where AI gets 90% right but the last 10% requires human judgement?", options: ["Remove the human step", "AI-assisted workflows where AI handles high-confidence cases autonomously and flags low-confidence cases for human review", "Lower the confidence threshold", "Build a better model first"] },
  { id: "t15-09", tier: 15, question_text: "Designing for AI 'graceful degradation' means:", options: ["Making the UI prettier when AI is offline", "The product continues to be useful when the AI component fails — fallback to rules, cached results, or manual alternatives", "Gradually removing AI features", "Slowing down AI responses"] },
  { id: "t15-10", tier: 15, question_text: "The term 'AI fatigue' in UX research refers to:", options: ["The model running out of compute", "Users becoming desensitised to or annoyed by AI suggestions that appear too frequently or are too often wrong", "Users running out of patience", "AI features taking too long to load"] },
  { id: "t15-11", tier: 15, question_text: "The best approach for communicating AI limitations to non-technical users is:", options: ["Technical accuracy — describe model architecture in detail", "Plain-language boundary-setting — 'This AI is best for X, not Y' with concrete examples of what it does and doesn't handle well", "Say nothing — limitations undermine trust", "Bury limitations in the terms of service"] },
  { id: "t15-12", tier: 15, question_text: "For an AI product serving neurodivergent users, the most important design consideration is:", options: ["Faster response times", "Consistent, predictable AI behaviour with clear structure — unexpected outputs or changing patterns are disproportionately disorienting for neurodiverse users", "Larger font sizes", "More animations"] },
  { id: "t15-13", tier: 15, question_text: "'AI onboarding' best practices include:", options: ["Full feature dump on first login", "Progressive capability introduction — teach core value in the first session, surface advanced features as users demonstrate readiness", "No onboarding — users should discover independently", "One-time tooltip tour"] },
  { id: "t15-14", tier: 15, question_text: "When an AI feature generates content that the user edits (e.g. AI-drafted email), the most important analytics metric is:", options: ["% of drafts accepted without edits", "Edit distance between AI draft and final submitted version — smaller edits mean higher quality AI output", "Time to first AI suggestion", "Number of suggestions generated"] },
  { id: "t15-15", tier: 15, question_text: "The 'consent and control' principle for AI personalisation means:", options: ["AI can personalise without user knowledge", "Users should be able to understand what data drives personalisation, correct it, and opt out — control builds trust and reduces regulatory risk", "Personalisation should be hidden to prevent gaming", "Only paying users get control"] },
];

// ─── TIER 16: Advanced Experimentation & Causal Inference ────────────────────

const T16: Question[] = [
  { id: "t16-01", tier: 16, question_text: "The fundamental assumption of A/B testing is violated when:", options: ["The test runs for less than 2 weeks", "Users in the treatment group interact with users in the control group (SUTVA violation — interference)", "The sample size is over 10,000", "The engineer runs the test"] },
  { id: "t16-02", tier: 16, question_text: "Difference-in-Differences (DiD) analysis is used when:", options: ["You have a perfectly randomised experiment", "You have a natural experiment with treatment and control groups measured before and after, but random assignment wasn't possible", "You have a very large dataset", "You want to test multiple features simultaneously"] },
  { id: "t16-03", tier: 16, question_text: "An AI PM runs an A/B test and finds p=0.04. They should:", options: ["Immediately ship the feature", "Consider whether the test was powered adequately, whether multiple hypotheses were tested (requiring correction), and whether the effect size is practically significant", "Run the test again", "Report the finding to the CEO"] },
  { id: "t16-04", tier: 16, question_text: "'Interleaving experiments' for search ranking A/B tests are preferred because:", options: ["They are easier to set up", "They directly compare two rankers for the same user on the same query, eliminating between-user variance and dramatically increasing sensitivity", "They require fewer users", "They are more interpretable"] },
  { id: "t16-05", tier: 16, question_text: "The 'long-term holdout' experiment design is used to:", options: ["Save compute costs by running shorter experiments", "Measure the long-term (often causal) effect of a feature by keeping a small holdout group without it for months after general rollout", "Test features on a small subset only", "Run experiments in parallel"] },
  { id: "t16-06", tier: 16, question_text: "Regression discontinuity design (RDD) is appropriate when:", options: ["Data is continuous", "There is a sharp threshold that determines treatment assignment (e.g. a credit score cutoff) — units just above/below the threshold are near-random", "You have balanced groups", "The outcome variable is binary"] },
  { id: "t16-07", tier: 16, question_text: "When testing a new ML model in production, 'canary deployment' means:", options: ["Deploying to all users simultaneously", "Rolling out to a small % of traffic first, monitoring key metrics and error rates, before widening the rollout", "Testing only in a staging environment", "Deploying only to internal users"] },
  { id: "t16-08", tier: 16, question_text: "Which of these is the best way to detect 'sample ratio mismatch' (SRM) in an A/B test?", options: ["Check if p < 0.05", "Test whether the observed split between treatment and control matches the intended allocation using a chi-squared test — SRM invalidates the experiment", "Run the test longer", "Increase the sample size"] },
  { id: "t16-09", tier: 16, question_text: "The benefit of 'sequential testing' (always-valid p-values) in A/B testing is:", options: ["It requires no minimum sample size", "You can monitor results continuously and stop as soon as significance is reached without inflating the false-positive rate", "It works without a control group", "It avoids the need for a hypothesis"] },
  { id: "t16-10", tier: 16, question_text: "In multi-armed bandit experimentation, the 'explore-exploit trade-off' in the context of a product launch means:", options: ["Whether to build new features or maintain old ones", "How much traffic to send to suboptimal variants (to learn) vs the best-known variant (to maximise reward) — relevant for fast-moving tests", "Whether to hire more engineers", "How aggressively to discount the product"] },
  { id: "t16-11", tier: 16, question_text: "Instrumental variable (IV) analysis solves which problem in causal inference?", options: ["Multiple testing correction", "Unmeasured confounding — an instrument affects treatment assignment but doesn't affect outcome except through treatment, enabling unbiased causal estimates", "Small sample sizes", "High-dimensional feature spaces"] },
  { id: "t16-12", tier: 16, question_text: "The 'variance reduction' benefit of including pre-experiment covariates in CUPED or ANCOVA is:", options: ["It reduces the number of users needed", "By explaining some of the outcome variance using pre-experiment data, the estimate of the treatment effect becomes more precise — enabling faster or more sensitive tests", "It eliminates confounders", "It reduces compute cost"] },
  { id: "t16-13", tier: 16, question_text: "The 'surrogate metric' approach is used in long-horizon product experiments because:", options: ["It replaces the need for A/B tests", "Short-term metrics (surrogates) that are highly correlated with long-term outcomes can be used to make faster product decisions without waiting months for LTV signals", "It increases experiment accuracy", "It eliminates novelty effects"] },
  { id: "t16-14", tier: 16, question_text: "Multivariate testing (MVT) differs from A/B testing in that:", options: ["MVT is easier to set up", "MVT tests multiple factors simultaneously to understand interaction effects — useful when you want to understand how combinations of changes affect outcomes", "MVT requires fewer users", "MVT always beats A/B testing"] },
  { id: "t16-15", tier: 16, question_text: "The correct way to handle a 'peeking problem' in classical frequentist A/B testing is:", options: ["Check results every hour", "Determine required sample size via power analysis before the test, commit to not checking until sample is reached, or switch to sequential testing", "Use a lower p-value threshold", "Ignore statistical significance and use effect size only"] },
];

// ─── TIER 17: AI Safety, Alignment & Responsible AI ─────────────────────────

const T17: Question[] = [
  { id: "t17-01", tier: 17, question_text: "The 'alignment problem' in AI refers to:", options: ["Ensuring AI code is properly indented", "The challenge of building AI systems that reliably pursue intended goals even in novel situations without producing harmful side effects", "Aligning ML team incentives with business goals", "Syncing AI models across data centres"] },
  { id: "t17-02", tier: 17, question_text: "A PM's role in AI safety is best described as:", options: ["Delegating safety entirely to the safety team", "Defining acceptable risk levels for their product context, embedding safety requirements in product specs, and shipping safety mitigations with features — not after", "Testing the model for jailbreaks personally", "Writing safety documentation post-launch"] },
  { id: "t17-03", tier: 17, question_text: "The EU AI Act's risk classification that places AI systems used for CV scoring, credit decisions, and medical diagnosis in:", options: ["Low risk — no requirements", "High risk — requiring conformity assessments, explainability, human oversight, and data governance before deployment", "Minimal risk — just transparency requirements", "Prohibited — completely banned"] },
  { id: "t17-04", tier: 17, question_text: "Constitutional AI (CAI) as used by Anthropic differs from RLHF in that:", options: ["CAI uses more compute", "CAI uses a set of principles (a 'constitution') to guide self-critique and revision of outputs, reducing reliance on human labellers for safety", "CAI was developed earlier than RLHF", "CAI uses reinforcement learning only"] },
  { id: "t17-05", tier: 17, question_text: "For a content moderation AI PM, 'dual newspaper test' means:", options: ["Testing the model in two newspapers", "Asking: (1) would this be reported as harmful content escaped? And (2) would this be reported as over-aggressive censorship? — both harms matter", "Running two separate moderation models", "Publishing results in two journals"] },
  { id: "t17-06", tier: 17, question_text: "The 'mesa-optimisation' risk in AI describes:", options: ["Optimising for the wrong business metric", "A learned sub-optimiser that pursues a proxy goal that correlates with the training objective but diverges from it in deployment", "Optimising too slowly", "A numerical precision issue in training"] },
  { id: "t17-07", tier: 17, question_text: "The 'responsible scaling policy' (RSP) approach taken by Anthropic commits to:", options: ["Releasing all models publicly", "Pausing or changing capability development when evaluations detect dangerous capabilities above defined thresholds", "Reducing model size at each release", "Publishing all training data"] },
  { id: "t17-08", tier: 17, question_text: "When a deployed AI system causes harm, the PM's ethical obligation is:", options: ["Blame the data scientists", "Acknowledge harm publicly, remediate affected users, conduct a root cause analysis, and implement structural fixes — not just patches", "Delete logs to reduce legal exposure", "Wait for legal to advise before taking any action"] },
  { id: "t17-09", tier: 17, question_text: "The 'dual use' problem for AI tools (e.g. protein folding, code generation) means:", options: ["The tools can run on two devices", "The same capability that has beneficial uses can also be used to cause harm — PMs must make intentional decisions about access and mitigations", "The tool has two versions", "It can serve two customer segments"] },
  { id: "t17-10", tier: 17, question_text: "Differential privacy in AI products provides:", options: ["Different privacy levels for different users", "Formal mathematical guarantees that individual data points in the training set cannot be inferred from model outputs or parameters", "Better user segmentation", "Improved model performance"] },
  { id: "t17-11", tier: 17, question_text: "'Specification gaming' in reinforcement learning AI means:", options: ["Hacking the game console", "The agent finds unexpected ways to maximise the reward function that satisfy the specification but violate the designer's intent", "Writing unclear requirements", "Testing edge cases in games"] },
  { id: "t17-12", tier: 17, question_text: "The NIST AI Risk Management Framework (AI RMF) organises AI risk into:", options: ["Model accuracy vs inference speed", "Govern, Map, Measure, and Manage — a lifecycle framework for identifying, assessing, and mitigating AI risks", "Security vs privacy risks only", "Technical vs business risks"] },
  { id: "t17-13", tier: 17, question_text: "An AI PM building a hiring tool is told by legal that disparate impact analysis isn't required because the model isn't making 'final' decisions. The correct response is:", options: ["Accept the legal opinion without question", "Push back — tools used to shortlist or rank candidates have a documented history of embedding discrimination even without 'final decision' authority", "Remove all demographic data from the model", "Add a human review step and consider the issue resolved"] },
  { id: "t17-14", tier: 17, question_text: "The 'race to the bottom' dynamic in AI safety is when:", options: ["Companies compete to build smaller models", "Competitive pressure causes companies to cut safety timelines to ship faster — each company does it because others are doing it, producing a collectively worse outcome", "Companies race to the bottom on pricing", "Open-source models outcompete closed models"] },
  { id: "t17-15", tier: 17, question_text: "The best way for an AI PM to handle a model that produces subtly biased outputs on a rare edge case is:", options: ["Ship it — edge cases are low impact", "Characterise the failure mode, assess the worst-case harm frequency and severity, implement a mitigation, and document the known limitation in product communications", "Delay launch indefinitely", "File a bug and ship anyway"] },
];

// ─── TIER 18: Multimodal AI & Emerging Architectures ─────────────────────────

const T18: Question[] = [
  { id: "t18-01", tier: 18, question_text: "The key product challenge of multimodal AI (image + text) is:", options: ["Models are too slow", "Evaluation complexity — assessing quality across modalities requires different metrics and human evaluation protocols", "Models are too large to deploy", "Users don't want multimodal features"] },
  { id: "t18-02", tier: 18, question_text: "Vision Language Models (VLMs) are most impactful for which product use case?", options: ["Text translation", "Visual search, document understanding, medical imaging analysis, and any task requiring joint reasoning over images and text", "Audio transcription", "Code generation"] },
  { id: "t18-03", tier: 18, question_text: "The 'hallucination in images' problem for VLMs means:", options: ["The model generates pixelated images", "The model confidently describes visual elements that don't exist in the image — a distinct failure mode from text hallucination", "Images load slowly", "The model confuses two images"] },
  { id: "t18-04", tier: 18, question_text: "For an AI video generation product, the most important PM product decision is:", options: ["The resolution of generated videos", "Use case definition and safety mitigations — video generation is high-risk for deepfakes, synthetic disinformation, and CSAM", "Compute cost per second", "The maximum video length"] },
  { id: "t18-05", tier: 18, question_text: "Diffusion models (e.g. Stable Diffusion, DALL-E) generate images by:", options: ["Selecting from a database of existing images", "Iteratively denoising a noisy image through learned reverse diffusion steps, guided by text or other conditioning", "Combining parts of existing images", "Using a GAN discriminator"] },
  { id: "t18-06", tier: 18, question_text: "Integrating AI voice assistants into products requires which additional PM consideration vs text AI?", options: ["Larger screen sizes", "Latency is perceived much more acutely in voice — response time > 500ms breaks conversational flow; plus ASR errors compound into downstream LLM errors", "More powerful GPUs", "Wider network connectivity"] },
  { id: "t18-07", tier: 18, question_text: "The 'world model' concept in AI refers to:", options: ["A model trained on global datasets", "An AI system's internal simulation of how the world works — enabling planning and prediction without direct experience", "A 3D world-building AI", "The model weights representing world knowledge"] },
  { id: "t18-08", tier: 18, question_text: "Audio foundation models (like Whisper for transcription, AudioLM for generation) most directly enable which product category?", options: ["Text summarisation only", "Real-time transcription, voice cloning, audio search, multilingual voice products, and accessibility tools for hearing-impaired users", "Image editing", "Computer vision"] },
  { id: "t18-09", tier: 18, question_text: "For an enterprise document intelligence product, Optical Character Recognition (OCR) + VLM is preferred over OCR alone because:", options: ["VLMs are always better", "VLMs understand layout, tables, and context around text elements — not just raw characters. This dramatically improves accuracy on complex documents", "OCR is too expensive", "VLMs are cheaper"] },
  { id: "t18-10", tier: 18, question_text: "The 'tokenisation of images' in vision transformers (ViTs) works by:", options: ["Compressing images to reduce file size", "Dividing images into fixed-size patches, then treating each patch as a token — allowing the same transformer architecture to process both images and text", "Pixel-by-pixel analysis", "Extracting edge features only"] },
  { id: "t18-11", tier: 18, question_text: "Which product decision most reduces the risk of 'NSFW content generation' in a user-facing image generation product?", options: ["Lower model quality", "Pre-generation prompt classifiers + post-generation image safety classifiers + fine-tuned model refusals + user reporting loop", "Charge higher prices", "Restrict to B2B only"] },
  { id: "t18-12", tier: 18, question_text: "The 'embodied AI' product category differs from language/vision AI because:", options: ["It only works on mobile", "It involves AI systems that perceive and act in physical environments (robots, autonomous vehicles) — the feedback loop is physical, not digital", "It uses smaller models", "It generates text about physical objects"] },
  { id: "t18-13", tier: 18, question_text: "For a code AI assistant using AST (Abstract Syntax Tree) analysis, the PM advantage over pure LLM code suggestions is:", options: ["Faster code generation", "Structurally valid suggestions that respect programming language grammar rules — reducing syntactically impossible outputs and improving developer trust", "Lower compute cost", "Better natural language understanding"] },
  { id: "t18-14", tier: 18, question_text: "The concept of 'AI agents with persistent memory' enables which product capability?", options: ["Faster model training", "Long-horizon assistance — the agent remembers past interactions, user preferences, and completed tasks to provide contextual help across sessions", "Better image quality", "Offline use only"] },
  { id: "t18-15", tier: 18, question_text: "The 'physical AI' trend (AI in robots, IoT, and edge devices) creates which unique PM requirement vs cloud AI?", options: ["Larger context windows", "On-device model optimisation (quantisation, pruning) — models must fit and run efficiently on constrained hardware without cloud connectivity", "Better safety filters", "Larger training datasets"] },
];

// ─── TIER 19: AI Platform PM & Infrastructure ─────────────────────────────────

const T19: Question[] = [
  { id: "t19-01", tier: 19, question_text: "An AI platform PM's primary customer is:", options: ["End consumers of the AI product", "Internal teams and developers — the platform PM enables others to build AI products faster and more reliably", "The board of directors", "External API customers only"] },
  { id: "t19-02", tier: 19, question_text: "MLOps (Machine Learning Operations) is to ML what DevOps is to software — the PM's role in MLOps is:", options: ["Writing the Kubernetes configs", "Defining SLOs for model freshness, inference latency, and uptime; ensuring retraining pipelines, monitoring, and rollback capabilities are productised", "Not relevant — MLOps is purely engineering", "Hiring MLOps engineers"] },
  { id: "t19-03", tier: 19, question_text: "The key PM consideration when choosing between 'model-as-a-service' (API) vs 'self-hosted' LLM deployment is:", options: ["APIs always have better models", "Data privacy, latency, cost at scale, customisation needs, and vendor lock-in — these trade-offs change significantly at different stages and scales", "Self-hosted is always better for enterprise", "APIs are always cheaper"] },
  { id: "t19-04", tier: 19, question_text: "Inference optimisation techniques (quantisation, batching, speculative decoding) matter for AI product PMs because:", options: ["They improve model quality", "They directly impact the cost-quality-latency trade-off that determines which AI features are economically viable to ship", "They simplify model architecture", "They are purely engineering concerns"] },
  { id: "t19-05", tier: 19, question_text: "The 'model serving' SLA that most directly impacts user experience in a real-time AI product is:", options: ["Training throughput (examples/sec)", "P99 inference latency — the 99th percentile response time, which determines whether the slowest 1% of requests feel broken to users", "GPU utilisation", "Model checkpoint size"] },
  { id: "t19-06", tier: 19, question_text: "When an AI platform serves 50+ product teams, which governance mechanism best prevents quality regressions from upstream model updates?", options: ["Release notes alone", "Versioned model contracts with integration tests that product teams run on each release — failures block the rollout to affected teams", "Manual review by the platform team", "Announcing updates in Slack"] },
  { id: "t19-07", tier: 19, question_text: "The primary PM metric for an internal ML platform is:", options: ["Number of models trained", "Developer velocity — measured by time from idea to production model for a new use case", "GPU utilisation rate", "Number of API calls per day"] },
  { id: "t19-08", tier: 19, question_text: "Chaos engineering applied to AI systems means:", options: ["Running experiments with random hyperparameters", "Deliberately injecting failures (data corruption, model version mismatch, latency spikes) to test system resilience before they happen in production", "Disorganised development process", "Random feature releases"] },
  { id: "t19-09", tier: 19, question_text: "The most significant risk of 'model monoculture' (many products depending on a single foundation model) is:", options: ["Higher licensing costs", "Correlated failures — a quality regression or outage in the foundation model propagates simultaneously to all dependent products, with no fallback", "Slower innovation", "Less model diversity"] },
  { id: "t19-10", tier: 19, question_text: "The correct approach for an AI platform PM when two product teams want conflicting changes to the shared model is:", options: ["Give priority to the senior team", "Create a neutral multi-stakeholder forum with transparent prioritisation criteria based on user impact and strategic alignment", "Implement both changes", "Reject both requests"] },
  { id: "t19-11", tier: 19, question_text: "The 'LLM gateway' pattern in enterprise AI architecture serves which purpose?", options: ["Generating LLM responses faster", "A single control plane for routing, rate limiting, caching, logging, and cost tracking across multiple LLM providers — enabling central governance", "Training LLMs in-house", "A user-facing chat interface"] },
  { id: "t19-12", tier: 19, question_text: "For a PM evaluating AI infrastructure costs, 'compute cost per successful user task' is preferred over 'tokens per request' because:", options: ["It's easier to calculate", "It ties compute cost to user value delivered, enabling ROI analysis — raw token counts don't reveal whether expensive compute produced useful outcomes", "It requires less instrumentation", "Token counts are not useful"] },
  { id: "t19-13", tier: 19, question_text: "The PM's role in setting 'model governance' policies includes:", options: ["Reviewing all model outputs personally", "Defining approval workflows, documentation standards, bias testing requirements, and incident response procedures for model deployments", "Only reviewing model architecture", "Delegating all governance to compliance"] },
  { id: "t19-14", tier: 19, question_text: "The advantage of 'model distillation' from a PM product decision perspective is:", options: ["Always produces better quality", "Smaller, faster models derived from a large teacher model — enabling deployments in cost- or latency-constrained contexts without rebuilding from scratch", "Reduces training data requirements", "Eliminates model biases"] },
  { id: "t19-15", tier: 19, question_text: "When evaluating whether to build a multi-tenant AI platform vs single-tenant deployments for enterprise customers, the PM's key consideration is:", options: ["Always multi-tenant is better", "Data isolation requirements — regulated industries often require strict tenant isolation that single-tenant deployments provide, at higher cost", "Multi-tenant is always cheaper", "Single-tenant is always higher quality"] },
];

// ─── TIER 20: Frontier AI — AGI, Emerging Tech & Paradigm Shifts ─────────────

const T20: Question[] = [
  { id: "t20-01", tier: 20, question_text: "An AI PM building products on 'reasoning models' (like o1) should set user expectations that:", options: ["They respond faster than standard models", "They trade response latency for significantly higher accuracy on complex, multi-step reasoning tasks — best for low-frequency, high-stakes queries", "They are always the best choice", "They never make mistakes"] },
  { id: "t20-02", tier: 20, question_text: "The 'agentic loop' in autonomous AI agents consists of:", options: ["A feedback loop in model training", "Perceive (input), reason (plan), act (tool use), observe (feedback), repeat — the agent iterates until the task is complete or a stopping criterion is met", "A user experience loop", "A data pipeline loop"] },
  { id: "t20-03", tier: 20, question_text: "The 'AI CEO/autopilot' product concept where AI makes most operational decisions creates which unique PM challenge?", options: ["The AI is too expensive", "Accountability gaps — when an AI makes a consequential decision, who is accountable? Humans must remain accountable for AI decisions in their systems", "The AI works too slowly", "Users won't trust AI decisions"] },
  { id: "t20-04", tier: 20, question_text: "The 'model context protocol' (MCP) by Anthropic is designed to:", options: ["Increase model context window size", "Standardise how AI assistants connect to external tools, data sources, and APIs — enabling a composable ecosystem of AI integrations", "Reduce model training costs", "Define safety standards for models"] },
  { id: "t20-05", tier: 20, question_text: "The most significant product risk of deploying 'autonomous AI agents' in production is:", options: ["They are too slow", "Unbounded action spaces — agents can take unexpected sequences of actions with real-world consequences that are hard to predict or constrain in advance", "They require GPU clusters", "They can't handle edge cases"] },
  { id: "t20-06", tier: 20, question_text: "'Compute governance' as an AI safety mechanism involves:", options: ["Reducing cloud spending", "Tracking, reporting, and potentially restricting compute used for training large AI models as a lever to regulate frontier AI development", "Optimising GPU utilisation", "Building more data centres"] },
  { id: "t20-07", tier: 20, question_text: "The 'scaling hypothesis' that has driven much of recent AI progress states:", options: ["Larger models are always safer", "Model capability scales predictably with compute, data, and parameters — enabling roadmap planning based on extrapolated capability improvements", "Scaling is no longer effective", "More data always beats more compute"] },
  { id: "t20-08", tier: 20, question_text: "The 'AI product moat' that is most durable as foundation models commoditise is:", options: ["Using the most powerful model", "Distribution, data network effects, workflow integration depth, and switching costs — not model performance, which commoditises rapidly", "Having proprietary models", "Low pricing"] },
  { id: "t20-09", tier: 20, question_text: "The concept of 'AI-native companies' (e.g. Midjourney, Perplexity) differs from 'AI-enhanced companies' in that:", options: ["AI-native companies have larger teams", "AI is the core product, not a feature — the entire value proposition, business model, and operations are designed around AI capabilities from day one", "AI-native companies avoid LLMs", "AI-enhanced companies are more profitable"] },
  { id: "t20-10", tier: 20, question_text: "For a PM planning a product roadmap in a world where AI capability is improving rapidly, the right strategy is:", options: ["Freeze the roadmap annually", "Maintain a 'living roadmap' with 3-month detail and directional 12-month bets — be prepared to replace planned features with AI-native equivalents as capabilities improve", "Only plan 1 month ahead", "Ignore AI improvements in roadmap planning"] },
  { id: "t20-11", tier: 20, question_text: "The 'context window as working memory' analogy means that for agentic AI systems:", options: ["The agent always forgets old conversations", "The agent's ability to handle complex, multi-step tasks is fundamentally bounded by how much state it can hold in context at once", "Longer context always produces better results", "Context windows are not important for agents"] },
  { id: "t20-12", tier: 20, question_text: "The frontier AI capability most likely to transform AI PM jobs in the next 3 years is:", options: ["Faster GPU inference", "Autonomous AI coding agents that can implement product requirements end-to-end — compressing the time from spec to working code by 10x", "Better text summarisation", "Improved speech-to-text"] },
  { id: "t20-13", tier: 20, question_text: "The 'post-AGI product strategy' question every senior PM should be thinking about is:", options: ["How to train AGI themselves", "If AI can do most cognitive work, what is the irreducible human value in product management — judgment under uncertainty, stakeholder trust, ethical accountability", "Whether to quit the field", "How to reduce headcount immediately"] },
  { id: "t20-14", tier: 20, question_text: "The 'AI + human collaborative intelligence' model is superior to AI-only for which category of decisions?", options: ["Routine, repetitive tasks at high volume", "Novel, high-stakes, ambiguous decisions where AI provides analysis but human judgment integrates context, values, and accountability", "Clearly defined optimisation problems", "Tasks with abundant training data"] },
  { id: "t20-15", tier: 20, question_text: "Building 'AI product intuition' as a PM means developing the skill to:", options: ["Write better prompts", "Rapidly assess which AI capabilities are mature enough for a given product use case, what the failure modes are, and whether the problem-capability fit justifies the investment", "Learn to train models", "Predict AI stock performance"] },
];

export const QUESTION_BANK: Question[] = [
  ...T1,
  ...T2,
  ...T3,
  ...T4,
  ...T5,
  ...T6,
  ...T7,
  ...T8,
  ...T9,
  ...T10,
  ...T11,
  ...T12,
  ...T13,
  ...T14,
  ...T15,
  ...T16,
  ...T17,
  ...T18,
  ...T19,
  ...T20,
];

// ─── Seeded shuffle using mulberry32 ────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns 10 reproducibly-shuffled questions for the given tier and seed.
 * Seed should be derived from userId + tier to ensure a consistent per-user
 * test (e.g. `seed = hashCode(userId + tier)`).
 */
export function getTestQuestions(tier: number, seed: number): Question[] {
  const pool = QUESTION_BANK.filter((q) => q.tier === tier);
  const rand = mulberry32(seed);
  // Fisher-Yates shuffle
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 10);
}

/**
 * Calculates karma delta from a test result.
 * Score is 0-10 (number of correct answers out of 10 questions).
 * Higher tiers award more karma for passing.
 */
export function calcKarmaDelta(score: number, tier: number): number {
  const pct = score / 10;
  if (pct >= 0.9) return parseFloat((tier * 0.05).toFixed(2));
  if (pct >= 0.6) return parseFloat((tier * 0.02).toFixed(2));
  return -0.1;
}
