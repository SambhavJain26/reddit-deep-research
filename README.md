
# Reddit Research Engine

A clean, dark-themed search engine interface that connects to Reddit data through a Python backend.

## Project Structure

```
reddit-oracle-search/
├── src/
│   ├── pages/
│   │   └── Index.tsx          # Main search interface
│   ├── services/
│   │   └── searchService.ts   # Backend communication service
│   └── ...                    # Other React components and utilities
├── streamlit_backend/         # (Create this for your Python backend)
│   └── app.py                 # Your Streamlit app
└── README.md
```

## Features

- **Dark Theme**: Clean, minimal dark interface
- **Responsive Design**: Works on desktop and mobile
- **Modular Architecture**: Easy to update and extend
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during searches

## Frontend Setup (React)

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd reddit-oracle-search
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The React app will be available at `http://localhost:5173`

## Backend Setup (Streamlit)

### Prerequisites
- Python 3.8+
- pip

### Create Streamlit Backend

1. Create a `streamlit_backend` directory in your project root:
```bash
mkdir streamlit_backend
cd streamlit_backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Streamlit:
```bash
pip install streamlit
```

4. Create `app.py` with your search logic:
```python
import streamlit as st
import json
from datetime import datetime

def search_reddit(query):
    """
    Placeholder function for Reddit search.
    Replace this with your actual Reddit search implementation.
    """
    # Current placeholder implementation
    return "search result shown"

def main():
    st.set_page_config(
        page_title="Reddit Research Engine API",
        page_icon="🔍",
        layout="wide"
    )
    
    # API endpoint for the React frontend
    if st.experimental_get_query_params().get("api"):
        query = st.experimental_get_query_params().get("query", [""])[0]
        if query:
            result = search_reddit(query)
            response = {
                "query": query,
                "result": result,
                "timestamp": datetime.now().isoformat()
            }
            st.json(response)
        else:
            st.error("No query provided")
    else:
        # Regular Streamlit interface (optional)
        st.title("Reddit Research Engine")
        st.subheader("Ask the internet's underground brain trust.")
        
        query = st.text_input("Enter your search query:")
        if st.button("Search") and query:
            with st.spinner("Searching..."):
                result = search_reddit(query)
                st.success("Search completed!")
                st.write("**Results:**")
                st.write(result)

if __name__ == "__main__":
    main()
```

5. Run the Streamlit app:
```bash
streamlit run app.py
```

The Streamlit app will be available at `http://localhost:8501`

## Connecting Frontend to Backend

### Option 1: Direct Integration (Current Setup)
The React app currently uses a placeholder service. To connect to your Streamlit backend:

1. Update the `searchService.ts` file to uncomment the actual API call code
2. Set the environment variable `REACT_APP_BACKEND_URL=http://localhost:8501`
3. Modify your Streamlit app to handle API requests properly

### Option 2: Using Streamlit as API
Create API endpoints in your Streamlit app that return JSON responses for the React frontend to consume.

### Option 3: Full Streamlit App
If you prefer to use Streamlit for the entire interface, you can recreate the dark theme styling using Streamlit's theming capabilities.

## Customization

### Updating the Search Logic
1. Replace the placeholder function in `streamlit_backend/app.py` with your Reddit search implementation
2. The `searchService.ts` file is already structured to handle the API communication

### Styling Changes
- Colors and spacing can be modified in `src/pages/Index.tsx`
- The design uses Tailwind CSS classes for easy customization
- Dark theme colors: `bg-gray-900`, `text-white`, `bg-gray-800`, etc.

### Adding Features
- Search history
- Advanced search filters
- Result pagination
- Export functionality

## Environment Variables

Create a `.env` file in the root directory:
```
REACT_APP_BACKEND_URL=http://localhost:8501
```

## Deployment

### Frontend (React)
```bash
npm run build
```

### Backend (Streamlit)
```bash
streamlit run streamlit_backend/app.py --server.port 8501
```

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python, Streamlit
- **Icons**: Lucide React
- **Styling**: Dark theme with clean, minimal design

## Next Steps

1. Implement your Reddit search model in the Streamlit backend
2. Update the API integration in `searchService.ts`
3. Add any additional features you need
4. Deploy both frontend and backend to your preferred hosting platforms

## Contributing

This project is designed to be modular and easy to extend. Feel free to add features, improve the UI, or enhance the search functionality.
