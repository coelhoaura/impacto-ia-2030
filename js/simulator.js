/**
 * What-If Career Transition & Upskilling ROI Simulator
 */

class CareerSimulator {
  constructor(data) {
    this.data = data;
    this.selectedTransition = data.careerTransitions[0];
    this.selectedTargetOption = this.selectedTransition.target_options[0];
  }

  setTransition(transitionId) {
    this.selectedTransition = this.data.careerTransitions.find(t => t.id === transitionId) || this.data.careerTransitions[0];
    this.selectedTargetOption = this.selectedTransition.target_options[0];
    return this.calculate();
  }

  setTargetOption(targetIndex) {
    this.selectedTargetOption = this.selectedTransition.target_options[targetIndex] || this.selectedTransition.target_options[0];
    return this.calculate();
  }

  calculate(customSalary = null, customCostBrl = null) {
    const curSal = customSalary !== null ? customSalary : this.selectedTransition.current_salary;
    const targetSal = this.selectedTargetOption.target_salary_usd;
    const costBrl = customCostBrl !== null ? customCostBrl : this.selectedTargetOption.cost_brl;
    
    // USD to BRL exchange rate for calculation
    const usdToBrl = 5.20;
    const annualGainUsd = targetSal - curSal;
    const annualGainBrl = annualGainUsd * usdToBrl;
    const monthlyGainBrl = annualGainBrl / 12;

    const paybackMonths = (costBrl / monthlyGainBrl).toFixed(1);
    const salaryMultiplier = (targetSal / curSal).toFixed(2);
    const salaryGrowthPct = (((targetSal - curSal) / curSal) * 100).toFixed(1);

    const initialRiskPct = Math.round(this.selectedTransition.current_risk_val * 100);
    const targetRiskPct = Math.round(this.selectedTargetOption.target_risk_val * 100);
    const riskReductionPct = initialRiskPct - targetRiskPct;

    return {
      currentJob: this.selectedTransition.current_title,
      currentSector: this.selectedTransition.current_sector,
      currentSalaryUsd: curSal,
      currentRiskPct: initialRiskPct,
      targetJob: this.selectedTargetOption.target_title,
      targetSector: this.selectedTargetOption.target_sector,
      targetSalaryUsd: targetSal,
      targetRiskPct: targetRiskPct,
      riskReductionPct: riskReductionPct,
      upskillTrack: this.selectedTargetOption.upskill_track,
      costBrl: costBrl,
      durationMonths: this.selectedTargetOption.duration_months,
      annualGainUsd: annualGainUsd,
      annualGainBrl: Math.round(annualGainBrl),
      salaryMultiplier: salaryMultiplier,
      salaryGrowthPct: salaryGrowthPct,
      paybackMonths: paybackMonths,
      roiScore: this.selectedTargetOption.roi_score,
      criticalSkills: this.selectedTargetOption.critical_skills
    };
  }
}

window.CareerSimulator = CareerSimulator;
