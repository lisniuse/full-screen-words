<template>
  <div v-if="show" class="word-modal">
    <div class="modal-wrapper">
      <button class="close-btn" @click="$emit('close')">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
      </button>

      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ word }}</h3>
          <div class="header-buttons">
            <button @click="toggleTheme" class="theme-btn">
              {{ isDarkMode ? '☀️' : '🌙' }}
            </button>
            <button @click="isPracticeMode = !isPracticeMode" class="practice-btn">
              {{ isPracticeMode ? '退出练习' : '开始练习' }}
            </button>
          </div>
        </div>
        <div class="info" v-if="info">
          <div class="word-forms">
            <template v-for="(form, type) in info.forms" :key="type">
              <div v-if="form && form.value" class="form-item">
                <h4>{{ getFormTitle(type) }}</h4>
                <div class="form-value">{{ form.value }}</div>
                <div class="examples">
                  <div v-for="(example, index) in form.examples" :key="index" class="example-item">
                    <div v-if="isPracticeMode">
                      <input 
                        v-model="example.userInput" 
                        :class="['practice-input', example.inputStatus]"
                        @input="checkAnswer(example)"
                        :placeholder="'请输入英文句子...'"
                      >
                      <div class="zh">{{ example.zh }}</div>
                    </div>
                    <div v-else>
                      <div class="en">{{ example.en }}</div>
                      <div class="zh">{{ example.zh }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div v-else-if="loading" class="loading">加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  show: Boolean,
  word: String,
  info: Object,
  loading: Boolean
})

const emit = defineEmits(['close'])

const isPracticeMode = ref(false)

const checkAnswer = (example) => {
  if (!example.userInput) {
    example.inputStatus = ''
    return
  }
  const normalizeText = (text) => {
    return text.toLowerCase().replace(/[.,!?]/g, '').trim()
  }
  
  example.inputStatus = normalizeText(example.userInput) === normalizeText(example.en) 
    ? 'correct' 
    : 'incorrect'
}

const getFormTitle = (type) => {
  const titles = {
    base: '原形',
    past: '过去式',
    pastParticiple: '过去分词',
    presentParticiple: '现在分词',
    thirdPerson: '第三人称单数',
    plural: '复数形式',
    comparative: '比较级',
    superlative: '最高级'
  }
  return titles[type] || type
}

const isDarkMode = ref(false)

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
}

onMounted(() => {
  // 检查系统主题偏好
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})
</script>
<style scoped>
.word-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.info {
  padding-top: 20px;
}

.modal-wrapper {
  position: relative;
  width: 90%;
  max-width: 600px;
}

.close-btn {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--bg-color);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  padding: 0;
  transition: all 0.3s ease;
  z-index: 1001;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.close-btn:hover {
  background-color: var(--hover-bg);
  color: var(--text-color);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.modal-content {
  background-color: var(--bg-color);
  padding: 0 30px;
  border-radius: 16px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.modal-header {
  position: sticky;
  top: 0;
  background-color: var(--bg-color);
  margin: -30px -30px 20px;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  z-index: 1;
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.theme-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.theme-btn:hover {
  background-color: var(--hover-bg);
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
  color: var(--text-color);
  flex: 1;
}

.practice-btn {
  background-color: #1a73e8;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s;
  margin-left: 20px;
  flex-shrink: 0;
}

.practice-btn:hover {
  background-color: #1557b0;
}

.form-item {
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 12px;
  background-color: var(--hover-bg);
  border: 1px solid var(--border-color);
}

.form-value {
  font-size: 18px;
  color: var(--text-color);
  margin: 12px 0;
  font-weight: 500;
}

h4 {
  color: #1a73e8;
  font-size: 16px;
  margin-bottom: 12px;
  font-weight: 500;
}

.examples {
  margin-top: 16px;
}

.example-item {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--bg-color);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.en {
  color: var(--text-color);
  margin-bottom: 8px;
  font-size: 15px;
  line-height: 1.5;
}

.zh {
  color: var(--text-color);
  opacity: 0.8;
  font-size: 14px;
  line-height: 1.5;
}

.loading {
  text-align: center;
  padding: 30px;
  color: var(--text-color);
  font-size: 16px;
}

.practice-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 15px;
  transition: all 0.3s;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.practice-input.correct {
  border-color: #4caf50;
  background-color: #f1f8e9;
}

.practice-input.incorrect {
  border-color: #f44336;
  background-color: #fde7e7;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: var(--hover-bg);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--text-color);
  opacity: 0.5;
}
</style>