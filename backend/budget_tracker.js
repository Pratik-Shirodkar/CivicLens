/**
 * Budget Tracker for CivicLens Agent
 * 
 * Tracks per-session and per-report spending with:
 * - Spend caps and budget awareness
 * - Per-tool cost breakdown
 * - Structured spend summary for audit trail
 */

class BudgetTracker {
    constructor(options = {}) {
        this.maxBudgetPerReport = options.maxBudgetPerReport || 50000;  // $0.05 USDC max per report
        this.maxBudgetPerSession = options.maxBudgetPerSession || 500000; // $0.50 USDC max per session
        this.currency = options.currency || "USDC";
        this.decimals = options.decimals || 6;

        // Tracking state
        this.sessionSpend = 0;
        this.reportSpends = [];  // Array of per-report breakdowns
        this.currentReport = null;
        this.toolCallLog = [];   // Full audit trail
    }

    /**
     * Start tracking a new report
     */
    startReport(reportId, description) {
        this.currentReport = {
            reportId,
            description: description?.substring(0, 50) || "Unknown",
            startedAt: new Date().toISOString(),
            toolCalls: [],
            totalSpend: 0,
        };
        return this.currentReport;
    }

    /**
     * Check if a tool call is within budget
     */
    canAfford(toolName, amount) {
        const amountNum = parseInt(amount);
        const reportSpend = (this.currentReport?.totalSpend || 0) + amountNum;
        const sessionSpend = this.sessionSpend + amountNum;

        return {
            allowed: reportSpend <= this.maxBudgetPerReport && sessionSpend <= this.maxBudgetPerSession,
            reason: reportSpend > this.maxBudgetPerReport
                ? `Report budget exceeded ($${this.formatUSD(reportSpend)} > $${this.formatUSD(this.maxBudgetPerReport)})`
                : sessionSpend > this.maxBudgetPerSession
                    ? `Session budget exceeded ($${this.formatUSD(sessionSpend)} > $${this.formatUSD(this.maxBudgetPerSession)})`
                    : "Within budget",
            remainingReportBudget: this.maxBudgetPerReport - (this.currentReport?.totalSpend || 0),
            remainingSessionBudget: this.maxBudgetPerSession - this.sessionSpend,
            estimatedCost: amountNum,
            costUSD: this.formatUSD(amountNum),
        };
    }

    /**
     * Record a completed tool call payment
     */
    recordPayment(toolName, amount, receipt = {}) {
        const amountNum = parseInt(amount);
        const toolCall = {
            tool: toolName,
            amount: amountNum,
            amountUSD: this.formatUSD(amountNum),
            currency: this.currency,
            timestamp: new Date().toISOString(),
            receipt,
        };

        // Update current report
        if (this.currentReport) {
            this.currentReport.toolCalls.push(toolCall);
            this.currentReport.totalSpend += amountNum;
        }

        // Update session total
        this.sessionSpend += amountNum;

        // Add to full audit trail
        this.toolCallLog.push(toolCall);

        return toolCall;
    }

    /**
     * Finalize current report and generate summary
     */
    finalizeReport() {
        if (!this.currentReport) return null;

        const report = {
            ...this.currentReport,
            completedAt: new Date().toISOString(),
            totalSpendUSD: this.formatUSD(this.currentReport.totalSpend),
            toolBreakdown: this.getToolBreakdown(this.currentReport.toolCalls),
        };

        this.reportSpends.push(report);
        this.currentReport = null;
        return report;
    }

    /**
     * Get per-tool cost breakdown
     */
    getToolBreakdown(toolCalls = null) {
        const calls = toolCalls || this.toolCallLog;
        const breakdown = {};

        for (const call of calls) {
            if (!breakdown[call.tool]) {
                breakdown[call.tool] = { calls: 0, totalSpend: 0 };
            }
            breakdown[call.tool].calls += 1;
            breakdown[call.tool].totalSpend += call.amount;
        }

        // Add USD formatting
        for (const tool of Object.keys(breakdown)) {
            breakdown[tool].totalSpendUSD = this.formatUSD(breakdown[tool].totalSpend);
        }

        return breakdown;
    }

    /**
     * Get full spend summary (for submission / audit)
     */
    getSpendSummary() {
        return {
            session: {
                totalSpend: this.sessionSpend,
                totalSpendUSD: this.formatUSD(this.sessionSpend),
                budgetLimit: this.maxBudgetPerSession,
                budgetLimitUSD: this.formatUSD(this.maxBudgetPerSession),
                budgetUsedPercent: ((this.sessionSpend / this.maxBudgetPerSession) * 100).toFixed(1) + "%",
                currency: this.currency,
            },
            toolBreakdown: this.getToolBreakdown(),
            totalToolCalls: this.toolCallLog.length,
            reportsProcessed: this.reportSpends.length,
            reports: this.reportSpends.map(r => ({
                reportId: r.reportId,
                description: r.description,
                totalSpendUSD: r.totalSpendUSD,
                toolCalls: r.toolCalls.length,
                startedAt: r.startedAt,
                completedAt: r.completedAt,
            })),
            fullAuditTrail: this.toolCallLog,
        };
    }

    /**
     * Format amount to USD string
     */
    formatUSD(amount) {
        return `$${(amount / Math.pow(10, this.decimals)).toFixed(4)}`;
    }

    /**
     * Get current status for terminal display
     */
    getStatus() {
        return {
            sessionSpendUSD: this.formatUSD(this.sessionSpend),
            remainingBudgetUSD: this.formatUSD(this.maxBudgetPerSession - this.sessionSpend),
            currentReportSpendUSD: this.currentReport ? this.formatUSD(this.currentReport.totalSpend) : "$0.0000",
            toolCalls: this.toolCallLog.length,
            reportsProcessed: this.reportSpends.length,
        };
    }
}

module.exports = { BudgetTracker };
