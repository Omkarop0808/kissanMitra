# Contributing to Kisaan Saathi

Welcome to Kisaan Saathi! This guide will help you get started with contributing to the project.

## 🚀 Quick Setup for New Contributors

### 1. Clone the Repository
```bash
git clone https://github.com/Omkarop0808/kissanMitra.git
cd Kisaan-Saathi
```

### 2. Set Up Development Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure API Keys
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys
# See GET_API_KEYS_AND_MODELS.md for detailed instructions
```

### 4. Run the Application
```bash
python app.py
```

Visit `http://127.0.0.1:8001` in your browser.

## 📁 Project Structure

```
Kisaan-Saathi/
├── app.py                      # Main FastAPI application (all routes + APIs)
├── FarmerAssistant.py          # LangGraph multi-agent AI assistant
├── prediction.py               # Disease prediction (Xception + Gemini)
├── hotspot.py                  # DBSCAN clustering + Folium maps
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
├── data/                       # JSON data storage (tracked in git)
│   ├── equipment.json
│   ├── waste_listings.json
│   ├── users.json
│   └── bookings.json
├── chroma_db/                  # Vector database (tracked in git)
├── templates/                  # HTML templates
├── static/                     # CSS, JS, images
└── Disease prediction Model/   # ML model files
```

## 🔧 Development Guidelines

### Code Style
- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add docstrings to functions and classes
- Keep functions focused and small

### Naming Conventions
- **Python files**: `snake_case.py`
- **HTML/CSS/JS files**: `kebab-case.html`
- **Functions**: `snake_case()`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`

### Before Committing
1. Test your changes locally
2. Run `python test_all_features.py` (if available)
3. Ensure no sensitive data (API keys, passwords) in code
4. Update documentation if needed

## 🌿 Git Workflow

### Creating a Feature Branch
```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Making Changes
```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: Add description of your feature"

# Push to your branch
git push origin feature/your-feature-name
```

### Commit Message Format
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Creating a Pull Request
1. Push your branch to GitHub
2. Go to the repository on GitHub
3. Click "New Pull Request"
4. Select your branch
5. Add description of changes
6. Submit for review

## 🎯 Areas to Contribute

### High Priority
- [ ] Add more disease categories to ML model
- [ ] Improve multi-language support
- [ ] Add more government schemes
- [ ] Enhance UI/UX for mobile devices
- [ ] Add unit tests for core functions

### Medium Priority
- [ ] Database migration (JSON → PostgreSQL/MongoDB)
- [ ] Add user profile management
- [ ] Implement notification system
- [ ] Add export functionality for reports
- [ ] Improve error handling

### Low Priority
- [ ] Add dark mode
- [ ] Implement caching for API calls
- [ ] Add analytics dashboard
- [ ] Create admin panel
- [ ] Add more chart types

## 🐛 Reporting Bugs

When reporting bugs, please include:
1. Description of the bug
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Environment details (OS, Python version)

## 💡 Suggesting Features

When suggesting features, please include:
1. Clear description of the feature
2. Use case / problem it solves
3. Proposed implementation (if you have ideas)
4. Impact on existing features

## 📝 Documentation

- Update README.md for major changes
- Add comments for complex logic
- Update API documentation if adding endpoints
- Keep REQUIREMENTS.md in sync with features

## 🧪 Testing

### Manual Testing
1. Test all affected features
2. Test on different browsers (Chrome, Firefox, Safari)
3. Test on mobile devices
4. Verify API responses

### Automated Testing
```bash
# Run test suite (when available)
python test_all_features.py
```

## 🔒 Security

- Never commit `.env` file
- Never commit API keys or passwords
- Use environment variables for sensitive data
- Report security issues privately to maintainers

## 📞 Getting Help

- Open an issue on GitHub
- Check existing issues and documentation
- Ask questions in pull request comments

## 🙏 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Kisaan Saathi! Together we're empowering farmers with technology.** 🌾
