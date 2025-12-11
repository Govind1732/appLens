# Dataset Hooks Reference

Complete documentation for React Query hooks managing datasets in AppLens.

## Overview

All dataset-related operations use React Query for state management with proper cache invalidation patterns.

### Backend Routes

```
GET    /api/datasets?appSpaceId=...      → Array of Datasets for appSpace
POST   /api/datasets/upload              → Multipart upload (file, appSpaceId, name)
POST   /api/datasets/connect             → Connect external DB (PostgreSQL/MySQL/MongoDB)
GET    /api/datasets/:id                 → Single dataset with populated appSpaceId
GET    /api/datasets/:id/data?limit=X    → Sample rows from file or external DB
DELETE /api/datasets/:id                 → Delete dataset and associated file
```

### Dataset Model Fields

- `_id`: MongoDB ObjectId
- `appSpaceId`: Reference to AppSpace
- `name`: Dataset name
- `sourceType`: 'csv' | 'json' | 'postgresql' | 'mysql' | 'mongodb'
- `schema`: Array of field definitions
- `recordsCount`: Total number of records
- `filePath`: Path to uploaded file (if file-based)
- `connectionDetails`: Connection config for external databases
- `createdBy`: User who created the dataset
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

---

## RETRIEVAL HOOKS (useQuery)

### 1. useDatasets(appSpaceId)

Fetch all datasets for a specific AppSpace.

```javascript
import { useDatasets } from "../../hooks/useDatasets";

function DatasetListPage() {
  const { data: datasets, isLoading, isError, error } = useDatasets(appSpaceId);

  if (isLoading) return <p>Loading datasets...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div>
      {datasets.map((dataset) => (
        <div key={dataset._id}>{dataset.name}</div>
      ))}
    </div>
  );
}
```

**Query Key**: `['datasets', appSpaceId]`

**Parameters**:

- `appSpaceId` (string): The AppSpace ID

**Returns**:

- `data`: Array of Dataset objects
- `isLoading`: Boolean indicating loading state
- `isError`: Boolean indicating error state
- `error`: Error object if request failed

**Behavior**:

- Only enabled when `appSpaceId` is provided
- Cached indefinitely (re-fetches on component mount if not in cache)
- Used by DatasetListPage to display all datasets

---

### 2. useDataset(datasetId)

Fetch a single dataset by ID with full details.

```javascript
import { useDataset } from "../../hooks/useDatasets";

function DatasetDetailPage() {
  const { datasetId } = useParams();
  const { data: dataset, isLoading, isError } = useDataset(datasetId);

  if (isLoading) return <p>Loading dataset...</p>;
  if (!dataset) return <p>Dataset not found</p>;

  return (
    <div>
      <h1>{dataset.name}</h1>
      <p>Records: {dataset.recordsCount}</p>
      <p>Type: {dataset.sourceType}</p>
    </div>
  );
}
```

**Query Key**: `['dataset', datasetId]`

**Parameters**:

- `datasetId` (string): The Dataset ID

**Returns**:

- `data`: Single Dataset object
- `isLoading`: Boolean indicating loading state
- `isError`: Boolean indicating error state
- `error`: Error object if request failed

**Behavior**:

- Only enabled when `datasetId` is provided
- Used by DatasetDetailPage to display dataset metadata

---

### 3. useDatasetData(datasetId, options)

Fetch sample rows from a dataset with pagination support.

```javascript
import { useDatasetData } from "../../hooks/useDatasets";

function DatasetPreview() {
  const { datasetId } = useParams();
  const { data: rows, isLoading } = useDatasetData(datasetId, {
    limit: 50,
    offset: 0,
  });

  if (isLoading) return <p>Loading data...</p>;

  return (
    <table>
      <tbody>
        {rows?.map((row, idx) => (
          <tr key={idx}>
            {Object.values(row).map((val, i) => (
              <td key={i}>{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Query Key**: `['datasetData', datasetId, limit, offset]`

**Parameters**:

- `datasetId` (string): The Dataset ID
- `options` (object, optional):
  - `limit` (number, default: 100): Number of rows to fetch
  - `offset` (number, default: 0): Number of rows to skip

**Returns**:

- `data`: Array of data objects (rows)
- `isLoading`: Boolean indicating loading state
- `isError`: Boolean indicating error state
- `error`: Error object if request failed

**Behavior**:

- Only enabled when `datasetId` is provided
- Different query keys generated for different limit/offset combinations
- Cached separately per pagination configuration
- Used by DatasetDetailPage to preview dataset contents

---

## MUTATION HOOKS (useMutation)

All mutation hooks automatically invalidate the `['datasets', appSpaceId]` query on success to keep the dataset list in sync.

### 1. useUploadDataset(appSpaceId)

Upload a CSV or JSON file as a new dataset.

```javascript
import { useUploadDataset } from "../../hooks/useDatasets";
import { useQueryClient } from "@tanstack/react-query";

function FileUploadForm() {
  const appSpaceId = useAppSpaceContext();
  const uploadDataset = useUploadDataset(appSpaceId);
  const queryClient = useQueryClient();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      uploadDataset.mutate(file, {
        onSuccess: (response) => {
          // response contains: { dataset, schemaPreview, sampleData }
          console.log("Upload successful:", response);
          // Datasets list automatically invalidated
        },
        onError: (error) => {
          console.error("Upload failed:", error);
        },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv,.json"
        onChange={handleFileChange}
        disabled={uploadDataset.isPending}
      />
      {uploadDataset.isPending && <p>Uploading...</p>}
      {uploadDataset.isError && <p>Error: {uploadDataset.error.message}</p>}
    </div>
  );
}
```

**Endpoint**: `POST /api/datasets/upload`

**Parameters**:

- `appSpaceId` (string): The AppSpace ID (used for cache invalidation)
- `file` (File): The file to upload (CSV or JSON)

**Request Format**:

```
FormData:
- file: File
- appSpaceId: string
- name: string (from file.name)
```

**Response**:

```javascript
{
  dataset: Dataset,
  schemaPreview: Array<{ field, type, exampleValue }>,
  sampleData: Array<Object>
}
```

**Usage**:

```javascript
uploadDataset.mutate(file);
```

**State**:

- `isPending`: Boolean indicating upload in progress
- `isError`: Boolean indicating upload failed
- `error`: Error object if upload failed
- `data`: Response from server on success

**Cache Invalidation**:

- Invalidates `['datasets', appSpaceId]` on success
- Datasets list automatically refetches to include new dataset

---

### 2. useConnectDatabase(appSpaceId)

Connect a PostgreSQL, MySQL, or MongoDB database as a dataset.

```javascript
import { useConnectDatabase } from "../../hooks/useDatasets";

function DatabaseConnectionForm() {
  const appSpaceId = useAppSpaceContext();
  const connectDatabase = useConnectDatabase(appSpaceId);

  const handleConnect = async (connectionData) => {
    connectDatabase.mutate(
      {
        name: "Production Database",
        sourceType: "postgresql",
        connectionDetails: {
          host: "db.example.com",
          port: 5432,
          database: "myapp_db",
          user: "postgres",
          password: "secure_password",
          table: "users",
        },
      },
      {
        onSuccess: (response) => {
          console.log("Connection successful:", response);
        },
        onError: (error) => {
          console.error("Connection failed:", error);
        },
      }
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Collect form data and call handleConnect
      }}
    >
      {/* Form fields */}
      <button disabled={connectDatabase.isPending}>
        {connectDatabase.isPending ? "Connecting..." : "Connect"}
      </button>
    </form>
  );
}
```

**Endpoint**: `POST /api/datasets/connect`

**Parameters**:

- `appSpaceId` (string): The AppSpace ID (used for cache invalidation)
- `connectionData` (object): Connection configuration

**Connection Data Formats**:

**PostgreSQL/MySQL**:

```javascript
{
  name: string,
  sourceType: 'postgresql' | 'mysql',
  connectionDetails: {
    host: string,
    port?: number,
    database: string,
    user: string,
    password: string,
    table: string
  }
}
```

**MongoDB**:

```javascript
{
  name: string,
  sourceType: 'mongodb',
  connectionDetails: {
    uri: string,
    database: string,
    collection: string
  }
}
```

**Response**:

```javascript
{
  dataset: Dataset,
  schemaPreview: Array<{ field, type, exampleValue }>,
  sampleData: Array<Object>
}
```

**Usage**:

```javascript
connectDatabase.mutate(connectionData);
```

**State**:

- `isPending`: Boolean indicating connection in progress
- `isError`: Boolean indicating connection failed
- `error`: Error object if connection failed
- `data`: Response from server on success

**Cache Invalidation**:

- Invalidates `['datasets', appSpaceId]` on success
- Datasets list automatically refetches to include new connected database

---

### 3. useDeleteDataset(appSpaceId)

Delete a dataset and associated file (if applicable).

```javascript
import { useDeleteDataset } from "../../hooks/useDatasets";

function DatasetCard({ dataset }) {
  const appSpaceId = useAppSpaceContext();
  const deleteDataset = useDeleteDataset(appSpaceId);

  const handleDelete = () => {
    if (window.confirm(`Delete dataset "${dataset.name}"?`)) {
      deleteDataset.mutate(dataset._id, {
        onSuccess: () => {
          console.log("Dataset deleted successfully");
          // Datasets list automatically invalidated and refetched
        },
        onError: (error) => {
          console.error("Delete failed:", error);
        },
      });
    }
  };

  return (
    <div className="card">
      <h3>{dataset.name}</h3>
      <button
        onClick={handleDelete}
        disabled={deleteDataset.isPending}
        className="btn-danger"
      >
        {deleteDataset.isPending ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
```

**Endpoint**: `DELETE /api/datasets/:id`

**Parameters**:

- `appSpaceId` (string): The AppSpace ID (used for cache invalidation)
- `datasetId` (string): The ID of the dataset to delete

**Response**:

```javascript
{
  message: "Dataset deleted successfully";
}
```

**Usage**:

```javascript
deleteDataset.mutate(datasetId);
```

**State**:

- `isPending`: Boolean indicating deletion in progress
- `isError`: Boolean indicating deletion failed
- `error`: Error object if deletion failed
- `data`: Response from server on success

**Cache Invalidation**:

- Invalidates `['datasets', appSpaceId]` on success
- Datasets list automatically refetches, excluding deleted dataset

---

## Query Key Patterns

Consistent query key structure for proper cache management:

```javascript
// Retrieval Queries
["datasets", appSpaceId][("dataset", datasetId)][ // All datasets in an AppSpace // Single dataset details
  ("datasetData", datasetId, limit, offset)
]; // Dataset rows with pagination

// Invalidation Pattern
// All mutations related to datasets invalidate ['datasets', appSpaceId]
// This causes dependent components to refetch automatically
```

---

## Cache Invalidation Strategy

```
Mutation: useUploadDataset
  ↓
POST /api/datasets/upload succeeds
  ↓
Invalidate: ['datasets', appSpaceId]
  ↓
useDatasets hooks automatically refetch
  ↓
DatasetListPage re-renders with new dataset
```

```
Mutation: useDeleteDataset
  ↓
DELETE /api/datasets/:id succeeds
  ↓
Invalidate: ['datasets', appSpaceId]
  ↓
useDatasets hooks automatically refetch
  ↓
DatasetListPage re-renders without deleted dataset
```

---

## Common Usage Patterns

### 1. Load datasets on AppSpace selection

```javascript
function DatasetListPage() {
  const appSpaceId = useAppSpaceContext();
  const { data: datasets, isLoading } = useDatasets(appSpaceId);

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        datasets.map((ds) => <DatasetCard key={ds._id} dataset={ds} />)
      )}
    </div>
  );
}
```

### 2. Display dataset details

```javascript
function DatasetDetailPage() {
  const { datasetId } = useParams();
  const { data: dataset } = useDataset(datasetId);
  const { data: sampleData } = useDatasetData(datasetId, { limit: 20 });

  return (
    <div>
      <h1>{dataset?.name}</h1>
      <PreviewTable data={sampleData} />
    </div>
  );
}
```

### 3. Upload new dataset

```javascript
function UploadModal({ appSpaceId, onClose }) {
  const uploadDataset = useUploadDataset(appSpaceId);

  const handleUpload = (file) => {
    uploadDataset.mutate(file, {
      onSuccess: () => {
        toast.success("Dataset uploaded successfully");
        onClose();
      },
      onError: (error) => {
        toast.error(`Upload failed: ${error.message}`);
      },
    });
  };

  return (
    <Modal isOpen>
      <FileInput onChange={(e) => handleUpload(e.target.files[0])} />
      {uploadDataset.isPending && <Spinner />}
    </Modal>
  );
}
```

### 4. Delete with confirmation

```javascript
function DeleteButton({ datasetId, appSpaceId }) {
  const deleteDataset = useDeleteDataset(appSpaceId);

  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      deleteDataset.mutate(datasetId);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleteDataset.isPending}>
      {deleteDataset.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
```

---

## Error Handling

All hooks provide error information through the `error` property:

```javascript
const { data, isError, error } = useDatasets(appSpaceId);

if (isError) {
  console.error("Error:", error.message);
  return <p>Failed to load datasets: {error.message}</p>;
}
```

Mutations also support `onError` callbacks:

```javascript
uploadDataset.mutate(file, {
  onError: (error) => {
    console.error("Upload failed:", error);
    // Show error toast
    toast.error(error.message);
  },
});
```

---

## Performance Considerations

1. **Query Deduplication**: React Query automatically deduplicates requests made within a short timeframe
2. **Stale Data**: Cached data is considered fresh indefinitely unless explicitly invalidated
3. **Pagination**: Different limit/offset combinations have separate cache entries
4. **Refetch on Window Focus**: Add `refetchOnWindowFocus: true` to queries if needed
5. **Background Refetch**: Combine with `staleTime` to control when background refetches occur

---

## Testing

```javascript
// Mock hooks for testing
jest.mock("../../hooks/useDatasets", () => ({
  useDatasets: jest.fn(() => ({
    data: mockDatasets,
    isLoading: false,
    isError: false,
  })),
  useUploadDataset: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
  })),
}));
```

---

## Troubleshooting

### Issue: Datasets list doesn't update after upload

**Solution**: Ensure `useUploadDataset` mutation has `onSuccess` callback that invalidates `['datasets', appSpaceId]`

### Issue: Stale data showing in detail page

**Solution**: Query key includes datasetId, so different datasets are cached separately. If same dataset shows old data, check cache stale time settings

### Issue: Multiple requests for same data

**Solution**: React Query deduplicates by default. Check if query keys are consistent across components

---

## API Reference Summary

| Hook                 | Type     | Route                      | Purpose                            |
| -------------------- | -------- | -------------------------- | ---------------------------------- |
| `useDatasets`        | Query    | GET /api/datasets          | Fetch all datasets for AppSpace    |
| `useDataset`         | Query    | GET /api/datasets/:id      | Fetch single dataset details       |
| `useDatasetData`     | Query    | GET /api/datasets/:id/data | Fetch dataset rows with pagination |
| `useUploadDataset`   | Mutation | POST /api/datasets/upload  | Upload CSV/JSON file               |
| `useConnectDatabase` | Mutation | POST /api/datasets/connect | Connect external database          |
| `useDeleteDataset`   | Mutation | DELETE /api/datasets/:id   | Delete dataset                     |

---

## Related Documentation

- [HOOKS_ARCHITECTURE.md](./HOOKS_ARCHITECTURE.md) - AI Insights hooks architecture
- [useAIChat.js Reference](./appLens-client/src/hooks/useAIChat.js) - AI chat and summary hooks
- React Query Docs: https://tanstack.com/query/latest
