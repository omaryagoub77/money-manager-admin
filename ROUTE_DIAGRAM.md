# Route Navigation Diagram

```mermaid
graph TD
    A[Home /] --> B[Login /login]
    A --> C[Dashboard /dashboard]
    A --> D[Deposits /deposits]
    A --> E[Chat /chat]
    
    C --> D
    C --> E
    D --> C
    D --> E
    E --> C
    E --> D
    
    style A fill:#e1f5fe
    style B fill:#fce4ec
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#f3e5f5
```

## Route Descriptions

- **Home /** - Main navigation hub (Light Blue)
- **Login /login** - Authentication page (Light Pink)
- **Dashboard /dashboard** - Overview statistics (Light Green)
- **Deposits /deposits** - Transaction management (Light Orange)
- **Chat /chat** - Customer support interface (Light Purple)

All protected routes (Dashboard, Deposits, Chat) share the same navigation components:
- Top navigation bar
- Side navigation menu

Users can navigate freely between protected routes using either navigation component.