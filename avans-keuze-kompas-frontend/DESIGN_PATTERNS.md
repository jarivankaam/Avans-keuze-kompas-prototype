# Design Patterns Implementation Guide

This document describes the design patterns implemented in the Avans Keuze Kompas frontend application.

## Table of Contents

1. [Overview](#overview)
2. [Singleton Pattern](#singleton-pattern)
3. [Factory Pattern](#factory-pattern)
4. [Usage Examples](#usage-examples)
5. [Migration Guide](#migration-guide)
6. [Best Practices](#best-practices)

---

## Overview

The codebase has been refactored to implement two key design patterns:

- **Singleton Pattern**: For centralized management of configuration, API client, and authentication
- **Factory Pattern**: For consistent and validated object creation

### Benefits

- ✅ Eliminated code duplication (API base URL was hardcoded in 2 places)
- ✅ Centralized configuration management
- ✅ Improved error handling and validation
- ✅ Better testability and maintainability
- ✅ Type-safe object creation
- ✅ Consistent authentication state management

---

## Singleton Pattern

### 1. ConfigManager

**Location**: `src/app/lib/config.ts`

Centralized configuration management for the entire application.

#### Features

- Environment-aware configuration
- Type-safe access to settings
- Helper methods for common operations
- Single source of truth for all configuration

#### Usage

```typescript
import { getConfig } from '@/app/lib/config';

const config = getConfig();

// Access configuration
const apiUrl = config.getApiUrl('/vkm');
const isDevMode = config.IS_DEVELOPMENT;
const tokenKey = config.TOKEN_KEY;

// Check feature flags
if (config.isFeatureEnabled('darkMode')) {
  // Enable dark mode
}
```

#### Available Configuration

| Property | Type | Description |
|----------|------|-------------|
| `API_BASE` | string | Base URL for API requests |
| `API_TIMEOUT` | number | API request timeout (ms) |
| `TOKEN_KEY` | string | LocalStorage key for auth token |
| `TOKEN_REFRESH_THRESHOLD` | number | Minutes before expiry to refresh |
| `APP_NAME` | string | Application name |
| `IS_DEVELOPMENT` | boolean | Development mode flag |
| `IS_PRODUCTION` | boolean | Production mode flag |

### 2. ApiClient

**Location**: `src/app/lib/apiClient.ts`

Centralized HTTP client for all API requests.

#### Features

- Consistent request/response handling
- Automatic authentication header injection
- Type-safe API methods
- Error handling and logging
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)

#### Usage

```typescript
import { getApiClient } from '@/app/lib/apiClient';

const apiClient = getApiClient();

// VKM-specific methods
const items = await apiClient.getVKMItems();
const item = await apiClient.getVKMItem('123');
const newItem = await apiClient.createVKMItem(vkmData);
const updated = await apiClient.updateVKMItem('123', vkmData);
await apiClient.deleteVKMItem('123');

// Generic methods for other endpoints
const data = await apiClient.get('/custom-endpoint');
const result = await apiClient.post('/custom-endpoint', payload);
```

#### Error Handling

```typescript
import type { ApiError } from '@/app/lib/apiClient';

try {
  const items = await apiClient.getVKMItems();
} catch (error) {
  const apiError = error as ApiError;
}
```

### 3. AuthManager

**Location**: `src/app/lib/auth/authManager.ts`

Centralized authentication and token management.

#### Features

- JWT token storage and validation
- Automatic token expiration checking
- Token refresh capability (ready for backend implementation)
- Authentication state subscriptions
- Automatic cleanup on logout

#### Usage

```typescript
import { getAuthManager } from '@/app/lib/auth/authManager';

const authManager = getAuthManager();

// Login
const response = await authManager.login('user@example.com', 'password');

// Check authentication status
if (authManager.isAuthenticated()) {
  // User is logged in
}

// Get current token
const token = authManager.getToken();

// Get decoded token data
const userData = authManager.getDecodedToken();

// Get full auth state
const authState = authManager.getAuthState();

// Subscribe to auth state changes
const unsubscribe = authManager.subscribe((state) => {
  // Auth state changed
});

// Logout
authManager.logout();

// Cleanup subscription
unsubscribe();
```

#### Integration with React

The `useAuth` hook automatically syncs with AuthManager:

```typescript
import { useAuth } from '@/app/lib/auth/useAuth';

function MyComponent() {
  const { user, isLoggedIn, login, logout } = useAuth();

  if (!isLoggedIn) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Factory Pattern

### VKMFactory

**Location**: `src/app/lib/factories/VKMFactory.ts`

Factory for creating and validating VKM (Vrije Keuze Module) objects.

#### Features

- Consistent object creation with defaults
- Input validation and sanitization
- Multiple creation methods for different scenarios
- Type-safe transformations

#### Creation Methods

##### 1. Create Empty Object

```typescript
import VKMFactory from '@/app/lib/factories/VKMFactory';

const emptyVKM = VKMFactory.createEmpty();
// Returns VKMInput with all fields set to empty/zero values
```

##### 2. Create New Item

```typescript
const newVKM = VKMFactory.createNew('Course Name', 'Course description');
// Returns VKMInput with generated ID and provided name/description
```

##### 3. Create Complete Object

```typescript
const completeVKM = VKMFactory.createComplete({
  name: 'Advanced Programming',
  shortdescription: 'Learn advanced programming concepts',
  content: 'Full course content...',
  studycredit: 5,
  location: 'Building A',
  contact_id: 123,
  level: 'Bachelor'
});
```

##### 4. Create from Existing

```typescript
const existingVKM = { /* VKM object from API */ };
const vkmInput = VKMFactory.createFromExisting(existingVKM, {
  name: 'Updated Name',
  studycredit: 10
});
// Merges existing data with updates
```

##### 5. Update Existing

```typescript
const updated = VKMFactory.update(currentVKM, {
  studycredit: 10,
  location: 'Building B'
});
```

#### Validation

```typescript
const vkm = VKMFactory.createNew('', ''); // Invalid: empty fields

// Get validation errors
const errors = VKMFactory.validate(vkm);
// errors is ['Name is required', 'Short description is required']

// Check if valid
if (VKMFactory.isValid(vkm)) {
  await apiClient.createVKMItem(vkm);
}
```

#### Validation Rules

- **Name**: Required, max 255 characters
- **Short description**: Required, max 500 characters
- **Study credit**: 0-60 ECTS, non-negative
- All string fields are trimmed and sanitized

#### Utility Methods

```typescript
// Clone an object
const cloned = VKMFactory.clone(originalVKM);

// Convert VKM to VKMInput
const input = VKMFactory.toInput(vkm);

// Convert array of VKMs to VKMInputs
const inputs = VKMFactory.toInputArray(vkmArray);
```

---

## Usage Examples

### Complete Add Item Flow

```typescript
import { getApiClient } from '@/app/lib/apiClient';
import VKMFactory from '@/app/lib/factories/VKMFactory';

async function addNewVKM(name: string, description: string) {
  // Create VKM using factory
  const vkmInput = VKMFactory.createNew(name, description);

  // Validate before sending
  const errors = VKMFactory.validate(vkmInput);
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  // Send to API using singleton client
  const apiClient = getApiClient();
  const created = await apiClient.createVKMItem(vkmInput);

  return created;
}
```

### Complete Edit Item Flow

```typescript
async function editVKM(id: string, updates: { name: string; description: string }) {
  const apiClient = getApiClient();

  // Fetch existing item
  const existing = await apiClient.getVKMItem(id);

  // Create updated version using factory
  const updated = VKMFactory.createFromExisting(existing, {
    name: updates.name,
    shortdescription: updates.description
  });

  // Validate
  if (!VKMFactory.isValid(updated)) {
    const errors = VKMFactory.validate(updated);
    throw new Error(`Invalid data: ${errors.join(', ')}`);
  }

  // Update via API
  return await apiClient.updateVKMItem(id, updated);
}
```

### Authentication Flow

```typescript
import { getAuthManager } from '@/app/lib/auth/authManager';
import { getApiClient } from '@/app/lib/apiClient';

async function loginAndFetchData(email: string, password: string) {
  const authManager = getAuthManager();
  const apiClient = getApiClient();

  // Setup token getter for API client
  apiClient.setTokenGetter(() => authManager.getToken());

  // Login
  await authManager.login(email, password);

  // Token is automatically included in API requests
  const items = await apiClient.getVKMItems();

  return items;
}
```

---

## Migration Guide

### Migrating from Old API Functions

**Old Code:**
```typescript
import { getItems, createItem } from '@/app/lib/api';

const items = await getItems();
const newItem = await createItem(vkmData);
```

**New Code (Recommended):**
```typescript
import { getApiClient } from '@/app/lib/apiClient';
import VKMFactory from '@/app/lib/factories/VKMFactory';

const apiClient = getApiClient();

const items = await apiClient.getVKMItems();
const vkmData = VKMFactory.createNew('Name', 'Description');
const newItem = await apiClient.createVKMItem(vkmData);
```

**Note:** Old functions still work for backward compatibility but are marked as deprecated.

### Migrating Auth Code

**Old Code:**
```typescript
import { getToken, setToken, loginUser } from '@/app/lib/auth/authClient';

const token = getToken();
setToken('new-token');
await loginUser(email, password);
```

**New Code (Recommended):**
```typescript
import { getAuthManager } from '@/app/lib/auth/authManager';

const authManager = getAuthManager();

const token = authManager.getToken();
authManager.setToken('new-token');
await authManager.login(email, password);
```

---

## Best Practices

### 1. Always Use Factory for Object Creation

❌ **Don't:**
```typescript
const vkm = {
  id: Date.now(),
  name: name,
  shortdescription: desc,
  content: "",
  studycredit: 0,
  location: "",
  contact_id: 0,
  level: ""
};
```

✅ **Do:**
```typescript
const vkm = VKMFactory.createNew(name, desc);
```

### 2. Validate Before Sending to API

❌ **Don't:**
```typescript
await apiClient.createVKMItem(vkmData); // No validation
```

✅ **Do:**
```typescript
if (VKMFactory.isValid(vkmData)) {
  await apiClient.createVKMItem(vkmData);
} else {
  const errors = VKMFactory.validate(vkmData);
}
```

### 3. Use getConfig() for All Configuration

❌ **Don't:**
```typescript
const apiUrl = "http://akk-backend.panel.evonix-development.tech";
```

✅ **Do:**
```typescript
import { getConfig } from '@/app/lib/config';
const config = getConfig();
const apiUrl = config.API_BASE;
```

### 4. Initialize API Client with Auth

Always set the token getter when using the API client:

```typescript
import { getApiClient } from '@/app/lib/apiClient';
import { getAuthManager } from '@/app/lib/auth/authManager';

const apiClient = getApiClient();
const authManager = getAuthManager();

// Setup token injection
apiClient.setTokenGetter(() => authManager.getToken());
```

This is already done in `src/app/lib/api.ts` for backward compatibility.

### 5. Subscribe to Auth Changes in React Components

```typescript
useEffect(() => {
  const authManager = getAuthManager();

  const unsubscribe = authManager.subscribe((state) => {
    if (!state.isAuthenticated) {
      router.push('/login');
    }
  });

  return unsubscribe; // Cleanup on unmount
}, []);
```

---

## Testing

### Testing Singletons

```typescript
import ConfigManager from '@/app/lib/config';
import ApiClient from '@/app/lib/apiClient';
import AuthManager from '@/app/lib/auth/authManager';

// In tests, you can access the singleton instances
const config = ConfigManager.getInstance();
const apiClient = ApiClient.getInstance();
const authManager = AuthManager.getInstance();

// Mock methods for testing
jest.spyOn(apiClient, 'getVKMItems').mockResolvedValue([]);
```

### Testing Factory

```typescript
import VKMFactory from '@/app/lib/factories/VKMFactory';

test('creates valid VKM object', () => {
  const vkm = VKMFactory.createNew('Test', 'Description');

  expect(vkm.name).toBe('Test');
  expect(vkm.shortdescription).toBe('Description');
  expect(VKMFactory.isValid(vkm)).toBe(true);
});

test('validates required fields', () => {
  const vkm = VKMFactory.createNew('', '');
  const errors = VKMFactory.validate(vkm);

  expect(errors).toContain('Name is required');
  expect(errors).toContain('Short description is required');
});
```

---

## Summary

The implementation of Singleton and Factory patterns has significantly improved the codebase:

1. **ConfigManager**: Centralized configuration eliminates hardcoded values
2. **ApiClient**: Consistent HTTP client with error handling and auth integration
3. **AuthManager**: Robust authentication state management with token handling
4. **VKMFactory**: Type-safe, validated object creation

All existing code continues to work through backward-compatible wrapper functions, while new code can use the improved patterns directly.

For questions or issues, please refer to the inline code documentation or contact the development team.
