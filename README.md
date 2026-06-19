# Currency Converter

A modern web application for converting currencies using real-time exchange rates. Built with React (Vite) for the frontend and Flask for the backend.

## Features

- Real-time currency conversion
- Support for multiple international currencies
- User-friendly and responsive interface
- Fast conversion results
- REST API integration for exchange rates
- Cross-platform compatibility

## Tech Stack

### Frontend
- React.js
- Vite
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- Flask
- Flask-CORS
- Requests

## Project Structure

```
currency-converter/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/currency-converter.git
cd currency-converter
```

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate the virtual environment:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the Flask server:

```bash
python3 app.py
```

The backend will run on:

```
http://localhost:5000
```

## Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run on:

```
http://localhost:5173
```

## API Endpoint

### Convert Currency

```
GET /api/convert
```

Parameters:

| Parameter | Description |
|------------|------------|
| amount | Amount to convert |
| from | Source currency |
| to | Target currency |

Example:

```
/api/convert?amount=100&from=USD&to=INR
```

## Example

Input:

```
Amount: 100
From: USD
To: INR
```

Output:

```
₹8,500 (depending on current exchange rate)
```

## Future Enhancements

- Currency conversion history
- Historical exchange rate charts
- Favorite currencies
- Dark mode support
- Offline caching
- User authentication

## Author

Naveenkumar M

## License

This project is developed for educational and learning purposes.

