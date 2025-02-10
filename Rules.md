# ChatPhantom Contributing Guidelines

## Project Philosophy
ChatPhantom is designed to be a friendly, intuitive, and powerful chat interface that maintains a consistent phantom-themed brand identity throughout the application. Our goal is to create a maintainable, scalable, and high-quality codebase.

## Core Development Rules

### 1. Brand Consistency
- All UI elements must align with the phantom theme (ghostly, friendly, ethereal)
- Use the established color palette from `themes.css`
- New icons and images should maintain the phantom aesthetic
- Animations should be smooth and ghost-like in nature
- Keep the UI playful yet professional

### 2. Package Management
- Always use `yarn` as the package manager
- Document new dependencies in the README.md
- Keep `package.json` organized and clean
- Use exact versions for dependencies to ensure consistency
- Run `yarn audit` regularly to check for security vulnerabilities

### 3. Code Organization
- Separate concerns into different files to prevent overcrowding
- Follow the established directory structure:
  - `src/components/` for reusable UI components
  - `src/contexts/` for React Context providers
  - `src/hooks/` for custom hooks
  - `src/utils/` for utility functions
  - `src/assets/` for images and static files
  - `src/styles/` for global styles and themes
- Keep files focused and under 300 lines when possible
- Create new components when logic becomes complex

### 4. CSS Management
- Use CSS Modules exclusively (`.module.css` extension)
- Name CSS files to match their component (e.g., `ChatScreen.module.css`)
- Use BEM-like naming in modules: `componentName_elementName_modifierName`
- Avoid global styles except for theme variables
- Keep media queries with their relevant components
- Use CSS variables for shared values

### 5. Code Documentation
- Add concise, meaningful comments for:
  - Function purposes and parameters
  - Complex logic sections
  - State management decisions
  - Non-obvious UI behaviors
  - Context usage
- Use JSDoc format for function documentation
- Keep comments up-to-date with code changes

### 6. DRY (Don't Repeat Yourself)
- Create reusable components for repeated UI elements
- Extract common logic into custom hooks
- Use utility functions for shared operations
- Maintain a component library for common UI elements
- Share styles through CSS variables and mixins

### 7. State Management
- Use React Context API for global state management
- Create separate contexts for different concerns:
  - User context
  - Theme context
  - Phantom context
  - Chat context
- Keep context providers focused and well-documented
- Use local state for component-specific data
- Document context usage in components

### 8. Additional Best Practices
- Use TypeScript for better type safety and documentation
- Implement error boundaries for graceful error handling
- Use React.memo() for performance optimization when needed
- Implement loading states and error states consistently
- Follow accessibility guidelines (WCAG 2.1)
- Write unit tests for critical functionality
- Use meaningful variable and function names
- Implement proper error handling and user feedback
- Keep the bundle size optimized

### 9. Performance
- Lazy load components when possible
- Optimize images before adding to assets
- Use proper React hooks dependencies
- Implement virtual scrolling for long lists
- Monitor and optimize re-renders

### 10. Security
- Never store sensitive data in client-side code
- Implement proper input sanitization
- Use environment variables for configuration
- Follow security best practices for API calls
- Regularly update dependencies

## Pull Request Process
1. Ensure code follows all guidelines above
2. Update documentation as needed
3. Test thoroughly in development environment
4. Get code review from at least one team member
5. Ensure all CI checks pass

## Development Workflow
1. Create feature branches from `develop`
2. Use conventional commits
3. Keep PRs focused and manageable in size
4. Write meaningful commit messages
5. Regularly rebase with `develop`

Remember: These guidelines are living documentation. If you notice something missing or that could be improved, please suggest updates through a pull request. 