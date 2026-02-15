---
title: "Killing the God ViewModel: Vertical Slice Architecture in WPF"
date: "2026-02-19"
excerpt: "Stop building lasagna architectures. Learn how to apply Vertical Slice Architecture to WPF applications to decouple features, delete code safely, and cure the 'God ViewModel' syndrome."
coverImage: "/images/posts/wpf_vertical_slice.svg"
category: "Design Patterns"
---

## The Monolith in the Room

We've all seen it. The `MainViewModel.cs`.
It started small. Just a few properties for the User Name and the Selected Tab.
But then came the "Requirements."
Now it's 5,000 lines long, injects 14 services in its constructor, and has a region called `#region Legacy Stuff DO NOT TOUCH`.

This is the failure of **Horizontal Layer Architecture** in complex UI apps.
We were taught to separate concerns by **technical layer**:
*   `Views/`
*   `ViewModels/`
*   `Services/`
*   `Models/`

But features don't live in layers. Features cut across them.
When you change the "Login" logic, you touch the View, the ViewModel, the Service, and the DTO. In a horizontal architecture, files that change together are far apart.

## Vertical Slice Architecture: Organize by Feature

In 2026, we stop organizing by *what the file is* (ViewModel vs Service) and start organizing by *what the feature does*.

### The New Folder Structure

Instead of `ViewModels/`, your project looks like this:

```text
Features/
 ├── Login/
 │    ├── LoginView.xaml
 │    ├── LoginViewModel.cs
 │    ├── LoginCommand.cs
 │    └── LoginResponseProxy.cs
 ├── Dashboard/
 │    ├── DashboardView.xaml
 │    ├── DashboardViewModel.cs
 │    └── SalesChartData.cs
 └── Inventory/
      ...
```

This is **Cohesion**. Things that change together, stay together.
Want to delete the "Login" feature? Delete the folder. Done. No hunting for tendrils in 5 other projects.

## The Secret Weapon: MediatR in WPF

"But wait," you say. "How do these decoupled features talk to each other?"
In ASP.NET Core, we use **MediatR**. Why not in WPF?

By treating Component A's need for data as a **Query** and Component B's action as a **Command**, we decouple them completely.

### Example: The "Checkout" Feature

The `CheckoutViewModel` doesn't need to know about the `InventoryService`. It just sends a command.

```csharp
// Features/Checkout/CheckoutViewModel.cs
public class CheckoutViewModel : ObservableObject
{
    private readonly IMediator _mediator;

    public CheckoutViewModel(IMediator mediator) => _mediator = mediator;

    [RelayCommand]
    public async Task PurchaseAsync()
    {
        // We just send a message. We don't know WHO handles it.
        var result = await _mediator.Send(new SubmitOrderCommand(CartItems));
        
        if (result.Success)
            NavigateToSuccess();
    }
}
```

Then, deep in the `Features/Orders/` folder, a handler processes it.

```csharp
// Features/Orders/SubmitOrderHandler.cs
public class SubmitOrderHandler : IRequestHandler<SubmitOrderCommand, OrderResult>
{
    // Only this class needs the heavy DbContext
    private readonly AppDbContext _db; 
    
    public async Task<OrderResult> Handle(...) 
    {
        // Business logic here...
    }
}
```

## Comparisons

| Traditional (Layered) | Vertical Slice |
| :--- | :--- |
| **Dependency Hell**: ViewModels inject everything. | **Clean**: ViewModels inject only `IMediator`. |
| **Spaghetti**: Logic is spread across Helpers/Services. | **Localized**: Logic is in the Handler. |
| **Change Risk**: Touching `UserService` breaks 10 screens. | **Safe**: Changing `LoginHandler` affects only Login. |

## Conclusion

WPF is old, but your architecture doesn't have to be.
Stop building horizontal lasagna layers. Start cutting vertical slices.
Your future self (who has to maintain this app) will thank you.
