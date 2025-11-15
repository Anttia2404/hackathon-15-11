# Components Structure

Cấu trúc components được tổ chức theo từng page/feature:

## 📁 Structure

```
components/
├── HomePage/               # Trang chủ
│   ├── HomePage.tsx       # Component chính
│   ├── HeroSection.tsx    # Hero section
│   ├── FeaturesSection.tsx
│   ├── ProblemSection.tsx
│   ├── SolutionSection.tsx
│   ├── TestimonialsSection.tsx
│   ├── DemoSection.tsx
│   └── index.ts           # Exports
│
├── LoginPage/             # Trang đăng nhập
│   ├── LoginPage.tsx      # Component chính
│   └── index.ts
│
├── StudentDashboard/      # Dashboard sinh viên
│   ├── StudentDashboard.tsx
│   ├── ActionPlanDisplay.tsx
│   └── index.ts
│
├── TeacherDashboard/      # Dashboard giảng viên
│   ├── TeacherDashboard.tsx
│   └── index.ts
│
├── SmartScheduler/        # Lịch học thông minh
│   ├── SmartScheduler.tsx # Component chính
│   ├── ContextTab.tsx     # Tab context
│   ├── ScheduleGeneratorTab.tsx
│   ├── StudyModeSelector.tsx
│   ├── TimeBlocker.tsx
│   ├── LifestyleSettings.tsx
│   ├── DeadlineForm.tsx
│   └── index.ts
│
├── AISummary/             # AI Summary feature
│   ├── AISummary.tsx
│   └── index.ts
│
├── QuizGenerator/         # Quiz generator feature
│   ├── QuizGenerator.tsx
│   └── index.ts
│
├── layouts/               # Shared layouts
│   ├── Navigation.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── index.ts
│
├── ui/                    # UI primitives (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
│
└── figma/                 # Figma imports
    └── ImageWithFallback.tsx
```

## 🎯 Nguyên tắc

1. **Mỗi page/feature = 1 folder**

   - Folder chứa component chính (file .tsx trùng tên)
   - Các components con nằm cùng folder
   - File `index.ts` để export

2. **Import paths**

   - Từ bên ngoài: `import { HomePage } from './components/HomePage'`
   - Giữa các pages: `import { Navigation } from '../layouts'`
   - UI components: `import { Button } from '../ui/button'`

3. **Shared components**
   - `layouts/` - Navigation, Sidebar, Footer
   - `ui/` - Reusable UI primitives
   - `figma/` - Figma design imports

## 📝 Usage

```tsx
// Trong App.tsx
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { Navigation } from "./components/layouts";

// Trong HomePage.tsx (import các sections con)
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
```
