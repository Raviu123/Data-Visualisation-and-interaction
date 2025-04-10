# DataVisAI - Interactive Data Visualization Platform

DataVisAI is an intelligent data visualization platform that combines automated chart generation with AI-powered insights. The platform allows users to upload their data files and instantly get meaningful visualizations and insights through an intuitive interface.

## Features

### 1. Intelligent Data Visualization
- Automatic chart type selection based on data characteristics
- Support for multiple chart types (Bar, Pie, Line charts)
- Real-time chart generation and rendering
- Interactive chart customization options

### 2. AI-Powered Analysis
- Chat interface for natural language data queries
- Automated insights generation for each visualization
- Smart data pattern recognition
- Trend analysis and anomaly detection

### 3. Report Generation
- Drag-and-drop report builder
- AI-generated analysis for each chart
- PDF export functionality
- Custom report templates

### 4. User Management
- Secure user authentication
- Personal data storage
- File upload history
- Session management

## Technology Stack

### Frontend
- React.js
- Chart.js for visualizations
- TailwindCSS for styling
- Axios for API communication

### Backend
- Python Flask
- MongoDB with GridFS
- Google Gemini AI
- Pandas for data processing

## Installation

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.11 or higher)
- MongoDB

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run the server:
```bash
python app.py
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend/visualisation_and_interaction
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

1. **User Registration/Login**
   - Create an account or login with existing credentials
   - Manage your profile and uploaded files

2. **Data Upload**
   - Support for CSV and Excel files
   - Drag and drop interface
   - File size limit: 20MB

3. **Visualization**
   - Select your uploaded file
   - Get automatically generated charts
   - Customize chart appearance
   - Download charts as images

4. **AI Interaction**
   - Chat with AI about your data
   - Ask questions in natural language
   - Get detailed insights and analysis

5. **Report Creation**
   - Select charts to include
   - Add AI-generated insights
   - Customize layout
   - Export as PDF

## API Documentation

### Authentication Endpoints
- POST `/user/signup` - Register new user
- POST `/user/signin` - User login
- GET `/user/logout` - User logout

### File Management
- POST `/upload/files` - Upload new file
- GET `/upload/user-files/:userId` - Get user's files

### Visualization
- POST `/visualizations/charts` - Generate charts
- POST `/insights/datatable` - Get data table
- POST `/insights/chat` - Chat with AI

### Report Generation
- POST `/report/generate` - Generate report analysis

## Security Features
- JWT authentication
- Secure file storage
- User data isolation
- Session management
- Input validation

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Chart.js for visualization library
- Google Gemini for AI capabilities
- MongoDB for database management
- Flask team for the backend framework
