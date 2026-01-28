Use cases are the heart of the application, containing the business logic that
orchestrates interactions between different parts of the system.

A use case typically has the following responsibilities:

- Enforce authorization and access policies.
- Interact with ports to perform operations (e.g., data retrieval, persistence).
- Apply business rules and domain constraints.
- Return results or throw domain errors.

Use cases are organized into two main categories:

- Queries: Handle read-only operations. They never modify system state.
- Commands: Handle write operations. They change system state.

Each use case interacts exclusively with ports, which define interfaces for
external systems (databases, cache, message brokers, APIs, etc.).

This separation ensures:

- Loose coupling
- High testability
- Replaceable infrastructure
- Clear dependency direction

Use cases never import:

- HTTP adapters
- Framework code
- Infrastructure implementations

They depend only on:

- Ports
- Domain models
- Domain policies
- Domain errors

## Test Coverage

In this codebase, all use cases files has a test file associated to it, ensuring
that the business logic is thoroughly tested and validated.

get-user/ ├─ execute.ts └─ execute.test.ts

Use case tests validate:

- Happy path behavior
- Authorization rules
- Error cases
- Edge cases
- Interaction with dependencies (ports)

Mocks must be used for all ports.

No real database or network calls are allowed inside use case tests.

Use cases must be rigorously tested to ensure business rules are enforced
correctly and remain stable over time.

A suggested test structure:

```
immport { someUseCaseFactory } from './execute'
import { SomeDomainError } from '../errors'
import { expect, mock, describem, otherSutff } from 'bun:test

describe('someUseCaseFactory', () => {
  let someRepositoryMock: ReturnType<typeof mock<SomeRepository>>
  let sut: ReturnType<typeof someUseCaseFactory>

  beforeEach(() => {
    someRepositoryMock = mock<SomeRepository>()
    sut = someUseCaseFactory({
      someRepository: someRepositoryMock,
    })
  })

  it('should do something when condition X', async () => {
    // Arrange
    someRepositoryMock.someMethod.mockResolvedValue(/* ... */)

    // Act
    const result = await sut.execute({ /* params */ })

    // Assert
    expect(result).toEqual(/* expected result */)
    expect(someRepositoryMock.someMethod).toHaveBeenCalledWith(/* ... */)
  })

  it('should throw SomeDomainError when condition Y', async () => {
    // Arrange
    // ...

    // Act & Assert
    await expect(sut.execute({ /* params */ })).rejects.toThrow(
      SomeDomainError
    )
  })

  // More tests...
})
```

## File general style

Each use case file should follow this structure:

1. Imports (types first, then values)
2. Dependency interfaces
3. Input parameter interfaces
4. Factory function
5. Returned use case function

Example:

```import type { SomeRepository } from '@/ports/SomeRepository'
import type { OutputModel } from './models'
import { SomeDomainError } from './errors'
import { somePolicy } from './policies'

interface Dependencies {
  someRepository: SomeRepository
}

interface ExecuteParams {
  id: number
  name: string
}

export function someUseCaseFactory({ someRepository }: Dependencies) {
  return async function execute(
    params: ExecuteParams
  ): Promise<OutputModel> {
    if (!somePolicy(params.id)) {
      throw new SomeDomainError('Not allowed')
    }
    if (params.name.length < 3) {
      throw new SomeDomainError('Name too short')
    }
    await someRepository.doSomething(params.id)
    return { id: params.id, name: params.name }
  }
}
```

## 🎯 Design Rules

- No classes for use cases (functions only)
- No side effects outside dependencies
- No framework imports
- No shared mutable state
- One use case = one responsibility
