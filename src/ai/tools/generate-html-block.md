Use this tool to analyze the provided canvas image and generate interactive HTML/CSS/JS code that recreates the design shown in the image.

## When to Use This Tool

Use Generate HTML when:

1. The user is in "build" mode and wants to convert a canvas design into interactive HTML
2. You need to analyze an image of selected blocks and generate HTML/CSS/JS code
3. The user wants to build an interactive version of a design element

## How This Tool Works

This tool has **no input parameters**. It automatically analyzes the image attachment that was provided with the user's message. The image shows either:
- Selected blocks from the canvas (in build mode with selection)
- The full canvas (in build mode without selection)

**CRITICAL**: When you call this tool, it immediately creates a loading placeholder block on the canvas with a spinner. The tool returns the block ID of this loading block. 

**YOU MUST** use this ID when calling `addHTMLToCanvas` - it is required, not optional. Always pass the `updateBlockId` parameter with the ID returned by this tool.

## Your Task

When you call this tool, you should:

1. **Note the loading block ID** returned by the tool - you'll need it for `addHTMLToCanvas`

2. **Analyze the image** carefully to understand:
   - The visual design and layout
   - Interactive elements (buttons, inputs, hover states, etc.)
   - Colors, fonts, spacing, and styling
   - Any animations or transitions visible

3. **Generate complete HTML/CSS/JS code** that:
   - Recreates the visual design accurately
   - Includes all interactive functionality (clicks, hovers, form inputs, etc.)
   - Uses modern, clean HTML structure
   - Embeds CSS in a `<style>` tag
   - Embeds JavaScript in a `<script>` tag
   - Is self-contained (no external dependencies unless necessary)

4. **Call `addHTMLToCanvas` exactly ONCE** with:
   - The generated HTML string
   - **REQUIRED**: The `updateBlockId` from the loading block (you MUST include this)
   - Dimensions matching the loading block (400x300 default)
   - Position matching the loading block
   
**Remember**: Generate only ONE HTML block per user request. Call `addHTMLToCanvas` exactly once, then stop.

## HTML Structure

Generate a complete HTML document with:
- `<!DOCTYPE html>` declaration
- `<html>`, `<head>`, and `<body>` tags
- Embedded `<style>` tag with all CSS
- Embedded `<script>` tag with all JavaScript
- Semantic HTML structure
- Proper accessibility attributes where applicable

## Best Practices

- **Match the design exactly**: Colors, fonts, spacing, and layout should match the image
- **Include interactions**: Add event handlers for buttons, inputs, hover states, etc.
- **Use modern CSS**: Flexbox, Grid, CSS variables, etc.
- **Keep it self-contained**: All styles and scripts should be embedded
- **Consider responsive design**: Make sure the HTML works at the dimensions specified
- **Add proper event handlers**: onClick, onHover, onChange, etc. for interactive elements
- **Use semantic HTML**: Proper tags like `<button>`, `<input>`, `<form>`, etc.

## Workflow

1. Call `generateHTML` tool (no parameters needed)
2. Analyze the image attachment
3. Generate the HTML/CSS/JS code
4. Call `addHTMLToCanvas` tool with the generated HTML and positioning information

## Example

<example>
User (in build mode): [sends image of a button with text "Click Me"]
Assistant: I'll analyze the image and generate HTML code for this button.
*Calls generateHTML tool*
*Analyzes image: sees a blue rounded button with white text*
*Generates HTML with button, CSS for blue background and rounded corners, and JavaScript for click handler*
*Calls addHTMLToCanvas with the generated HTML*
</example>

## Summary

Use Generate HTML to convert canvas designs into interactive HTML/CSS/JS code. The tool analyzes the image automatically - you just need to call it and then generate the code based on what you see in the image.

