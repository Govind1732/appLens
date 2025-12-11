# AI Hooks Architecture

## Overview

The AI hooks have been restructured to follow the **Caching-as-a-Side-Effect** pattern, with clear separation between generation (mutations) and retrieval (queries).

## Hook Structure

### 📊 Dataset Summary Hooks

#### 1. `useGenerateSummary(datasetId)` - Generation Hook

- **Type**: `useMutation`
- **Route**: `POST /api/insights/summary/:datasetId`
- **Purpose**: Triggers AI to generate a new summary and saves it to the database
- **Cache Invalidation**:
  - `['summaryInsight', datasetId]`
  - `['datasetInsights', datasetId]`
  - `['chartSuggestions', datasetId]`

```javascript
const generateSummary = useGenerateSummary(datasetId);

// Usage
generateSummary.mutate(); // Trigger generation
```

#### 2. `useSummaryInsight(datasetId)` - Retrieval Hook

- **Type**: `useQuery`
- **Route**: `GET /api/insights/insights/:datasetId?type=summary`
- **Purpose**: Fetches the cached/saved summary from the database
- **Returns**: Most recent summary insight with structured data
- **Cache Time**: 5 minutes (AI responses are expensive)

```javascript
const { data: summaryInsight, isLoading } = useSummaryInsight(datasetId);

// Access structured data
const summary = summaryInsight?.summary;
const insights = summaryInsight?.structuredData?.insights || [];
const trendSummaries = summaryInsight?.structuredData?.trendSummaries || [];
const chartSuggestions = summaryInsight?.chartSuggestions || [];
```

---

### 📈 Chart Suggestions Hooks

#### 3. `useGenerateChartSuggestions(datasetId)` - Generation Hook

- **Type**: `useMutation`
- **Route**: `POST /api/insights/generate-chart-suggestions/:datasetId`
- **Purpose**: Generates new chart suggestions based on schema
- **Cache Invalidation**:
  - `['chartSuggestions', datasetId]`
  - `['summaryInsight', datasetId]`

```javascript
const generateCharts = useGenerateChartSuggestions(datasetId);

// Usage
generateCharts.mutate();
```

#### 4. `useChartSuggestions(datasetId)` - Retrieval Hook

- **Type**: `useQuery`
- **Route**: `GET /api/insights/chart-suggestions/:datasetId`
- **Purpose**: Fetches saved chart suggestions
- **Cache Time**: 5 minutes

```javascript
const { data: chartSuggestions, isLoading } = useChartSuggestions(datasetId);
```

---

### 💬 AI Chat Hooks

#### 5. `useAIChat(datasetId)` - Chat Mutation

- **Type**: `useMutation`
- **Route**: `POST /api/insights/chat/:datasetId`
- **Purpose**: Send a question to AI about the dataset
- **Cache Invalidation**: `['datasetInsights', datasetId]`

```javascript
const chatMutation = useAIChat(datasetId);

// Usage
chatMutation.mutate("What are the top trends in this data?");
```

---

### 📋 All Insights Hook

#### 6. `useDatasetInsights(datasetId, type?)` - Retrieval Hook

- **Type**: `useQuery`
- **Route**: `GET /api/insights/insights/:datasetId?type={type}`
- **Purpose**: Fetches all insights (both summary and chat)
- **Parameters**:
  - `type`: Optional filter ('summary' | 'chat')

```javascript
// Get all insights
const { data: allInsights } = useDatasetInsights(datasetId);

// Get only chat insights
const { data: chatInsights } = useDatasetInsights(datasetId, "chat");
```

---

## Data Structure

### Summary Insight Object

```javascript
{
  _id: "...",
  datasetId: "...",
  type: "summary",
  summary: "Brief description of the dataset",
  structuredData: {
    insights: ["insight 1", "insight 2", "insight 3"],
    trendSummaries: [
      {
        title: "Trend Title",
        description: "Description",
        trend: "positive" | "negative" | "neutral"
      }
    ]
  },
  chartSuggestions: [
    {
      chartType: "bar" | "line" | "pie" | "scatter" | "area",
      xAxis: "field_name",
      yAxis: "field_name",
      title: "Chart Title"
    }
  ],
  createdAt: "...",
  updatedAt: "..."
}
```

### Chat Insight Object

```javascript
{
  _id: "...",
  datasetId: "...",
  type: "chat",
  summary: "User's question",
  prompt: "User's question",
  chatResponse: "AI's response",
  createdAt: "...",
  updatedAt: "..."
}
```

---

## Benefits of This Architecture

✅ **Clear Separation**: Generation (POST) vs Retrieval (GET) are distinct  
✅ **Automatic Cache Invalidation**: Mutations automatically refresh related queries  
✅ **Better Performance**: Retrieval hooks cache data for 5 minutes  
✅ **Type Safety**: Clear data structures for frontend consumption  
✅ **No String Parsing**: Structured data stored directly in MongoDB  
✅ **Easier Debugging**: Each hook has a single, clear responsibility

---

## Migration Guide

### Old Pattern (Deprecated)

```javascript
// ❌ Old way - useQuery with POST (anti-pattern)
const { data: aiSummary, isLoading, refetch } = useDatasetSummary(datasetId);
```

### New Pattern (Recommended)

```javascript
// ✅ New way - Separate generation and retrieval
const generateSummary = useGenerateSummary(datasetId);
const { data: summaryInsight, isLoading } = useSummaryInsight(datasetId);

// Extract structured data
const aiSummary = summaryInsight
  ? {
      summary: summaryInsight.summary,
      insights: summaryInsight.structuredData?.insights || [],
      trendSummaries: summaryInsight.structuredData?.trendSummaries || [],
      chartSuggestions: summaryInsight.chartSuggestions || [],
    }
  : null;

// Trigger generation
<button onClick={() => generateSummary.mutate()}>
  {summaryInsight ? "Regenerate" : "Generate Insights"}
</button>;
```

---

## Example: DatasetDetailPage Implementation

```javascript
import { useGenerateSummary, useSummaryInsight } from "../../hooks/useAIChat";

function DatasetDetailPage() {
  const { datasetId } = useParams();

  // Separate hooks for generation and retrieval
  const generateSummary = useGenerateSummary(datasetId);
  const { data: summaryInsight, isLoading: summaryLoading } =
    useSummaryInsight(datasetId);

  // Extract structured data
  const aiSummary = summaryInsight
    ? {
        summary: summaryInsight.summary,
        insights: summaryInsight.structuredData?.insights || [],
        trendSummaries: summaryInsight.structuredData?.trendSummaries || [],
        chartSuggestions: summaryInsight.chartSuggestions || [],
      }
    : null;

  const aiLoading = summaryLoading || generateSummary.isPending;

  return (
    <div>
      <button onClick={() => generateSummary.mutate()} disabled={aiLoading}>
        {summaryInsight ? "Regenerate" : "Generate Insights"}
      </button>

      {aiSummary && (
        <>
          <p>{aiSummary.summary}</p>
          {aiSummary.insights.map((insight, i) => (
            <div key={i}>{insight}</div>
          ))}
        </>
      )}
    </div>
  );
}
```

---

## Technical Implementation Details

### Cache Invalidation Flow

```
1. User clicks "Generate Summary"
   ↓
2. useGenerateSummary.mutate() called
   ↓
3. POST /api/insights/summary/:datasetId
   ↓
4. Backend generates AI summary with Gemini
   ↓
5. Save to MongoDB with structuredData
   ↓
6. onSuccess: Invalidate queries
   - ['summaryInsight', datasetId]
   - ['datasetInsights', datasetId]
   - ['chartSuggestions', datasetId]
   ↓
7. useSummaryInsight automatically refetches
   ↓
8. UI updates with new structured data
```

### Query Key Structure

```javascript
// Summary
["summaryInsight", datasetId][
  // Chart Suggestions
  ("chartSuggestions", datasetId)
][
  // All Insights (with optional type filter)
  ("datasetInsights", datasetId, type)
][
  // Example with type filter
  ("datasetInsights", "123", "chat")
][("datasetInsights", "123", "summary")][("datasetInsights", "123", null)]; // All types
```

---

## Best Practices

1. **Always use `useGenerateSummary` for triggering AI generation**
2. **Use `useSummaryInsight` for displaying cached results**
3. **Extract `structuredData` fields to avoid null references**
4. **Show loading states during both generation and retrieval**
5. **Handle empty states when no insights exist yet**
6. **Use query invalidation to keep UI in sync**

---

## Future Enhancements

- [ ] Add streaming support for chat responses
- [ ] Implement optimistic updates for chat mutations
- [ ] Add pagination for chat history
- [ ] Support for custom query staleness times
- [ ] Error retry with exponential backoff on frontend
- [ ] Add TypeScript types for all hooks
