# Component interaction

## HTML, CSS and JavaScript interaction
`index.html` defines the main sections and navigation links.

`css/style.css` is responsible for layout, adaptive behavior and visual hierarchy.

`js/main.js` handles:
- collecting navigation links;
- smooth scrolling to sections;
- marking the active navigation item;
- initializing landing page behavior after DOM content is loaded.

## Interaction flow
1. The page loads.
2. JavaScript initializes navigation logic.
3. When a user clicks a navigation link, the default action is prevented.
4. The page scrolls smoothly to the selected section.
5. The active navigation item is updated.