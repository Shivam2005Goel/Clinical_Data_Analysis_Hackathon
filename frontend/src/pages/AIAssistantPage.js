import React, { useState } from 'react';
import api from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Bot, Send, FileText, TrendingUp, Lightbulb, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const AIAssistantPage = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [reportType, setReportType] = useState('site_performance');
  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState('');

  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState('');

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/query', { query });
      setResponse(res.data.response);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/generate-report', {
        report_type: reportType,
        context: {}
      });
      setReport(res.data.report);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setRecommendationsLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/recommend-actions');
      setRecommendations(res.data.recommendations);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get recommendations');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="ai-assistant-page">
      <div className="flex items-center gap-3">
        <Bot className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
          AI Assistant
        </h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Natural Language Query */}
      <Card data-testid="nl-query-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Natural Language Query
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuery} className="space-y-4">
            <div>
              <Textarea
                placeholder="Ask me anything about your clinical trial data... e.g., 'Which sites have the highest risk scores?' or 'Show me patients with missing pages'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
                data-testid="ai-query-input"
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()} data-testid="ai-query-submit">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Ask AI
                </>
              )}
            </Button>
          </form>

          {response && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200" data-testid="ai-query-response">
              <h4 className="font-semibold mb-2">AI Response:</h4>
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{response}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Generation */}
      <Card data-testid="report-generation-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                data-testid="report-type-select"
              >
                <option value="site_performance">Site Performance Report</option>
                <option value="cra_report">CRA Monitoring Report</option>
                <option value="risk_analysis">Risk Analysis Report</option>
              </select>
            </div>
            <Button
              onClick={handleGenerateReport}
              disabled={reportLoading}
              data-testid="generate-report-button"
            >
              {reportLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>

          {report && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200" data-testid="generated-report">
              <h4 className="font-semibold mb-2">Generated Report:</h4>
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{report}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Recommendations */}
      <Card data-testid="recommendations-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Action Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Get AI-powered recommendations for improving data quality, reducing risks, and optimizing site
              operations.
            </p>
            <Button
              onClick={handleGetRecommendations}
              disabled={recommendationsLoading}
              data-testid="get-recommendations-button"
            >
              {recommendationsLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Get Recommendations
                </>
              )}
            </Button>
          </div>

          {recommendations && (
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20" data-testid="ai-recommendations">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recommendations:
              </h4>
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                {recommendations}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistantPage;