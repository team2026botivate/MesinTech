# ============================================================
#  UI RULES — Vite + React + shadcn/ui
#  Every UI change, new component, or page MUST follow these.
# ============================================================

## STACK
- Framework : React (Vite)
- UI Library : shadcn/ui (ONLY — no MUI, Ant Design, Chakra, etc.)
- Styling    : Tailwind CSS utility classes (via shadcn's setup)
- Icons      : lucide-react (bundled with shadcn)
- Animations : tailwindcss-animate (bundled with shadcn)

---

## 1. COMPONENT USAGE — MANDATORY

### Always prefer shadcn/ui primitives
| Need                  | Use (shadcn)                                      |
|-----------------------|---------------------------------------------------|
| Button                | `<Button>` from `@/components/ui/button`          |
| Input / Textarea      | `<Input>` / `<Textarea>` from `@/components/ui/` |
| Select / Dropdown     | `<Select>` or `<DropdownMenu>`                    |
| Modal / Dialog        | `<Dialog>`                                        |
| Notification/Toast    | `<Sonner>` or `<Toast>` (via `useToast`)          |
| Tooltip               | `<Tooltip>`                                       |
| Badge / Label         | `<Badge>`                                         |
| Card / Panel          | `<Card>`, `<CardHeader>`, `<CardContent>`, etc.   |
| Table                 | `<Table>`, `<TableHeader>`, `<TableRow>`, etc.    |
| Tabs                  | `<Tabs>`, `<TabsList>`, `<TabsTrigger>`           |
| Form / Validation     | `<Form>` + react-hook-form (shadcn pattern)       |
| Checkbox / Switch     | `<Checkbox>` / `<Switch>`                         |
| Radio                 | `<RadioGroup>`, `<RadioGroupItem>`                |
| Accordion             | `<Accordion>`                                     |
| Sidebar / Sheet       | `<Sheet>` for mobile drawers/sidebars             |
| Command / Search      | `<Command>` / `<CommandInput>`                    |
| Popover               | `<Popover>`                                       |
| Date Picker           | `<Calendar>` + `<Popover>` (shadcn pattern)       |
| Progress              | `<Progress>`                                      |
| Skeleton Loader       | `<Skeleton>`                                      |
| Alert / Message       | `<Alert>`, `<AlertTitle>`, `<AlertDescription>`   |
| Separator             | `<Separator>`                                     |
| Avatar                | `<Avatar>`, `<AvatarImage>`, `<AvatarFallback>`   |
| Breadcrumb            | `<Breadcrumb>`                                    |
| Pagination            | `<Pagination>`                                    |

### NEVER use:
- Raw `<button>`, `<input>`, `<select>`, `<textarea>` HTML elements in UI code
  (exception: inside custom shadcn component internals only)
- Inline `style={{}}` for anything covered by Tailwind / shadcn tokens
- Third-party UI libraries alongside shadcn (no mixing)

---

## 2. IMPORTS

All shadcn components live in `@/components/ui/`.  
Always import from the correct path:

```tsx
// ✅ Correct
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Card,
         CardHeader,
         CardContent } from "@/components/ui/card";

// ❌ Wrong
import Button from "some-other-lib";
import { Button } from "../../components/ui/button"; // use alias
```

---

## 3. STYLING RULES

- Use **Tailwind utility classes** for layout, spacing, and typography.
- Use **shadcn CSS variables** for colors — never hardcode hex/rgb values.

```tsx
// ✅ Correct
<div className="bg-background text-foreground border border-border rounded-lg p-4">

// ❌ Wrong
<div style={{ backgroundColor: "#fff", color: "#000" }}>
```

### Core CSS variable tokens (always use these):
| Token                  | Purpose                        |
|------------------------|--------------------------------|
| `bg-background`        | Page / app background          |
| `bg-card`              | Card surfaces                  |
| `bg-primary`           | Primary action color           |
| `bg-secondary`         | Secondary / muted surfaces     |
| `bg-muted`             | Subtle backgrounds             |
| `bg-accent`            | Accent / hover states          |
| `bg-destructive`       | Error / danger states          |
| `text-foreground`      | Default body text              |
| `text-muted-foreground`| Placeholder / secondary text   |
| `text-primary-foreground` | Text on primary bg          |
| `border-border`        | Default borders                |
| `ring-ring`            | Focus rings                    |

---

## 4. DARK MODE

- shadcn dark mode is class-based (`.dark` on `<html>`).
- NEVER hardcode light-only colors. Always use CSS variable tokens so dark mode works automatically.
- Test every new component in both light and dark mode.

---

## 5. FORMS

Use the **shadcn Form pattern** (react-hook-form + zod):

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel,
         FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as z from "zod";

const schema = z.object({ email: z.string().email() });

export function MyForm() {
  const form = useForm({ resolver: zodResolver(schema) });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)}>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

---

## 6. TOASTS / NOTIFICATIONS

Use `sonner` (the shadcn-recommended toast library):

```tsx
import { toast } from "sonner";
toast.success("Saved successfully!");
toast.error("Something went wrong.");
```

Make sure `<Toaster />` from `sonner` is mounted once in your root layout.

---

## 7. ICONS

Use **lucide-react** exclusively:

```tsx
// ✅ Correct
import { Search, Plus, Trash2 } from "lucide-react";
<Search className="h-4 w-4" />

// ❌ Wrong — don't add other icon packs
import { FaSearch } from "react-icons/fa";
```

---

## 8. ADDING NEW shadcn COMPONENTS

When a component isn't in `@/components/ui/` yet, add it via CLI:

```bash
npx shadcn@latest add <component-name>
# Examples:
npx shadcn@latest add dialog
npx shadcn@latest add data-table
npx shadcn@latest add calendar
```

Never copy-paste shadcn source manually — always use the CLI so
`components.json` stays in sync.

---

## 9. FILE & FOLDER CONVENTIONS

```
src/
├── components/
│   ├── ui/            ← shadcn auto-generated (DO NOT edit manually)
│   └── [feature]/     ← your custom components (built with shadcn primitives)
├── pages/             ← route-level components
├── lib/
│   └── utils.ts       ← cn() helper lives here (from shadcn init)
└── hooks/             ← custom hooks (useToast, etc.)
```

Custom components **wrap** shadcn primitives — they do NOT reimplement them.

---

## 10. cn() HELPER — ALWAYS USE IT FOR CLASS MERGING

```tsx
import { cn } from "@/lib/utils";

// ✅ Correct — merges and deduplicates Tailwind classes safely
<div className={cn("p-4 rounded-lg", isActive && "bg-primary text-primary-foreground")} />

// ❌ Wrong — causes Tailwind class conflicts
<div className={`p-4 rounded-lg ${isActive ? "bg-primary text-primary-foreground" : ""}`} />
```

---

## 11. ACCESSIBILITY

- All interactive shadcn components are accessible by default — do not override `role`, `aria-*`, or keyboard handlers unless you have a specific reason.
- Always provide `<FormLabel>` for every `<FormControl>`.
- Use `<DialogTitle>` inside every `<Dialog>` (required by shadcn/radix).
- Tooltips must wrap focusable elements.

---

## 12. QUICK CHECKLIST (before every PR / commit)

- [ ] All UI elements use shadcn components (no raw HTML buttons/inputs)
- [ ] Colors use CSS variable tokens (no hardcoded hex)
- [ ] Icons are from lucide-react only
- [ ] Forms use react-hook-form + shadcn Form pattern
- [ ] New components added via `npx shadcn@latest add`
- [ ] `cn()` used for all conditional class merging
- [ ] Component tested in light AND dark mode
- [ ] No third-party UI libraries imported

---
# End of UI Rules
