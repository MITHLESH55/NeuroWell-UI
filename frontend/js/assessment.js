/**
 * NEUROWELL - Assessment Module
 * Handles multi-step assessment form
 * Manages question display, response capture, and progression
 */

const AssessmentManager = {
  currentStep: 1,
  totalSteps: CONSTANTS.ASSESSMENT.TOTAL_STEPS,
  responses: [],

  /**
   * Initialize assessment page
   */
  init: () => {
    console.log('🏥 Initializing Assessment...');

    // Load previous responses if exists
    const saved = StorageManager.getAssessmentResponses();
    if (saved && saved.responses) {
      AssessmentManager.responses = saved.responses;
    }

    // Render initial UI
    AssessmentManager.renderAssessment();

    // Set up event listeners
    AssessmentManager.setupEventListeners();

    console.log('✅ Assessment Ready');
  },

  /**
   * Render assessment UI
   */
  renderAssessment: () => {
    const container = document.getElementById('assessmentContainer');
    if (!container) return;

    // Render step indicator
    AssessmentManager.renderStepIndicator();

    // Render questions for current step
    AssessmentManager.renderQuestions();

    // Render navigation buttons
    AssessmentManager.renderNavigation();
  },

  /**
   * Render step indicator
   */
  renderStepIndicator: () => {
    const indicator = document.getElementById('stepIndicator');
    if (!indicator) return;

    let html = '<div class="step-indicator">';

    for (let i = 1; i <= AssessmentManager.totalSteps; i++) {
      const isActive = i === AssessmentManager.currentStep;
      const isCompleted = i < AssessmentManager.currentStep;
      let classNames = 'step';

      if (isActive) classNames += ' active';
      if (isCompleted) classNames += ' completed';

      html += `
        <div class="${classNames}">
          <div class="step-number">${isCompleted ? '✓' : i}</div>
          <div class="step-label">Step ${i}</div>
        </div>
      `;
    }

    html += '</div>';
    indicator.innerHTML = html;
  },

  /**
   * Render questions for current step with radio button options (horizontal)
   */
  renderQuestions: () => {
    const container = document.getElementById('questionsContainer');
    if (!container) return;

    const questions = QUESTIONS.filter(q => q.step === AssessmentManager.currentStep);
    let html = '';

    questions.forEach((question) => {
      const response = AssessmentManager.responses.find(r => r.question_id === question.id);
      const selectedValue = response ? response.value : 0;
      const selectedOption = selectedValue > 0 ? question.options[selectedValue - 1] : null;
      const selectedLabel = selectedOption ? selectedOption.label : 'Not answered';

      html += `
        <div class="question-card" data-animate data-question-id="${question.id}">
          <div class="question-header">
            <div class="question-number">Question ${question.id} of ${CONSTANTS.ASSESSMENT.TOTAL_QUESTIONS}</div>
            <span class="question-category">${question.category}</span>
          </div>
          <p class="question-text">${question.question}</p>

          <div class="radio-options" data-question-id="${question.id}" data-question-impact="${question.impact}">
            ${question.options.map((option, index) => `
              <label class="radio-option">
                <input 
                  type="radio" 
                  name="question-${question.id}" 
                  value="${option.value}" 
                  ${selectedValue === option.value ? 'checked' : ''}
                  data-question-id="${question.id}"
                  class="radio-input"
                />
                <span class="radio-label">${option.label}</span>
              </label>
            `).join('')}
          </div>

          <div class="selection-status">
            <span class="status-label">Selected:</span>
            <span class="status-value">${selectedLabel}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Attach event delegation for radio inputs
    container.addEventListener('change', AssessmentManager.onOptionChange);
  },

  /**
   * Render navigation buttons
   */
  renderNavigation: () => {
    const container = document.getElementById('navigationContainer');
    if (!container) return;

    let html = '<div class="button-group">';

    // Previous button
    if (AssessmentManager.currentStep > 1) {
      html += `
        <button class="btn btn-secondary" id="prevBtn">
          ← Previous
        </button>
      `;
    }

    // Next or Submit button
    if (AssessmentManager.currentStep < AssessmentManager.totalSteps) {
      html += `
        <button class="btn btn-primary" id="nextBtn">
          Next →
        </button>
      `;
    } else {
      html += `
        <button class="btn btn-success" id="submitBtn" style="flex: 1;">
          Submit Assessment ✓
        </button>
      `;
    }

    html += '</div>';
    container.innerHTML = html;

    // Attach button listeners
    if (document.getElementById('prevBtn')) {
      document.getElementById('prevBtn').addEventListener('click', AssessmentManager.previousStep);
    }
    if (document.getElementById('nextBtn')) {
      document.getElementById('nextBtn').addEventListener('click', AssessmentManager.nextStep);
    }
    if (document.getElementById('submitBtn')) {
      document.getElementById('submitBtn').addEventListener('click', AssessmentManager.submitAssessment);
    }
  },

  /**
   * Handle radio option change
   */
  onOptionChange: (e) => {
    const radioInput = e.target;
    if (!radioInput.classList.contains('radio-input')) return;

    const questionId = parseInt(radioInput.dataset.questionId);
    const value = parseInt(radioInput.value);
    const question = QUESTIONS.find(q => q.id === questionId);
    const selectedOption = question?.options?.find(opt => opt.value === value);
    const selectedLabel = selectedOption ? selectedOption.label : value;

    // Update responses array
    const existingIndex = AssessmentManager.responses.findIndex(r => r.question_id === questionId);
    if (existingIndex >= 0) {
      AssessmentManager.responses[existingIndex].value = value;
    } else {
      AssessmentManager.responses.push({ question_id: questionId, value: value });
    }

    // Update status display
    const questionCard = radioInput.closest('.question-card');
    if (questionCard) {
      const statusValue = questionCard.querySelector('.status-value');
      if (statusValue) {
        statusValue.textContent = selectedLabel;
      }
    }

    // Save to storage
    StorageManager.saveAssessmentResponses(AssessmentManager.responses);

    console.log(`📝 Question ${questionId} answered: ${value} (${selectedLabel})`);
  },

  /**
   * Handle response change (kept for compatibility)
   */
  onResponseChange: (e) => {
    // This function is now handled by onOptionChange
    // Kept for backward compatibility if needed
  },

  /**
   * Handle option click (deprecated - kept for reference)
   */
  onOptionClick: (e) => {
    // This function is no longer used with radio buttons
    // Kept for reference only
  },

  /**
   * Validate current step
   */
  validateStep: () => {
    const questions = QUESTIONS.filter(q => q.step === AssessmentManager.currentStep);
    
    for (const question of questions) {
      const response = AssessmentManager.responses.find(r => r.question_id === question.id);
      if (!response || response.value === 0) {
        AppManager.showNotification('⚠️ Please answer all questions on this step', 'warning');
        return false;
      }
    }

    return true;
  },

  /**
   * Move to next step
   */
  nextStep: () => {
    if (!AssessmentManager.validateStep()) return;

    if (AssessmentManager.currentStep < AssessmentManager.totalSteps) {
      AssessmentManager.currentStep++;
      AssessmentManager.renderAssessment();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log(`📍 Moved to step ${AssessmentManager.currentStep}`);
    }
  },

  /**
   * Move to previous step
   */
  previousStep: () => {
    if (AssessmentManager.currentStep > 1) {
      AssessmentManager.currentStep--;
      AssessmentManager.renderAssessment();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log(`📍 Moved to step ${AssessmentManager.currentStep}`);
    }
  },

  /**
   * Submit assessment
   */
  submitAssessment: () => {
    if (!AssessmentManager.validateStep()) return;

    // Prevent double submission
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.disabled = true;

    AppManager.showLoader('Analyzing Your Responses', 'Calculating wellness scores...');

    // Simulate processing delay
    setTimeout(() => {
      try {
        // Calculate scores
        const scores = ScoringEngine.calculateScores(AssessmentManager.responses);
        
        // Save scores and date
        StorageManager.saveWellnessScore(scores);
        StorageManager.saveLastAssessmentDate();
        StorageManager.saveHistoricalData(scores);

        AppManager.hideLoader();
        AppManager.showNotification('✅ Assessment completed successfully!', 'success');

        console.log('🎉 Assessment submitted', scores);

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 500);

      } catch (error) {
        AppManager.hideLoader();
        AppManager.showNotification('❌ Error processing assessment: ' + error.message, 'error');
        console.error('Assessment error:', error);
        
        if (submitBtn) submitBtn.disabled = false;
      }
    }, 1500);
  },

  /**
   * Set up event listeners
   */
  setupEventListeners: () => {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        if (nextBtn && !nextBtn.disabled) nextBtn.click();
        if (submitBtn && !submitBtn.disabled) submitBtn.click();
      }
    });

    // Save assessment on page unload
    window.addEventListener('beforeunload', () => {
      if (AssessmentManager.responses.length > 0) {
        StorageManager.saveAssessmentResponses(AssessmentManager.responses);
      }
    });
  },

  /**
   * Get assessment progress
   */
  getProgress: () => {
    const progress = StorageManager.getAssessmentProgress();
    return {
      step: AssessmentManager.currentStep,
      totalSteps: AssessmentManager.totalSteps,
      answered: progress.completed,
      total: progress.total,
      percentage: progress.percentage
    };
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', AssessmentManager.init);
