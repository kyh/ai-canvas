/**
 * HTML content for loading spinner in HTML blocks
 */
export const LOADING_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .text {
      margin-top: 12px;
      color: #6b7280;
      font-size: 14px;
      text-align: center;
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <div class="text">Building...</div>
  </div>
</body>
</html>`;
