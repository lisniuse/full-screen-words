<template>
  <div class="word-container" ref="container">
    <span 
      v-for="(word, index) in words" 
      :key="index"
      class="word-tag"
      @click="showWordInfo(word)"
    >
      {{ word }}
    </span>

    <!-- 弹窗显示单词信息 -->
    <div v-if="showModal" class="word-modal">
      <div class="modal-wrapper">
        <button class="close-btn" @click="showModal = false">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
          </svg>
        </button>

        <div class="modal-content">
          <h3>{{ selectedWord }}</h3>
          <div v-if="wordInfo">
            <div class="word-forms">
              <template v-for="(form, type) in wordInfo.forms" :key="type">
                <div v-if="form && form.value" class="form-item">
                  <h4>{{ getFormTitle(type) }}</h4>
                  <div class="form-value">{{ form.value }}</div>
                  <div class="examples">
                    <div v-for="(example, index) in form.examples" :key="index" class="example-item">
                      <div class="en">{{ example.en }}</div>
                      <div class="zh">{{ example.zh }}</div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as randomWords from 'random-words'

const words = ref([])
const container = ref(null)
const showModal = ref(false)
const selectedWord = ref('')
const wordInfo = ref(null)
const loading = ref(false)

const generateWords = () => {
  const windowHeight = window.innerHeight
  const avgWordHeight = 30
  const avgWordsPerRow = Math.floor(window.innerWidth / 100)
  const estimatedRows = Math.ceil(windowHeight / avgWordHeight)
  const totalWords = estimatedRows * avgWordsPerRow

  words.value = randomWords.generate({ exactly: totalWords })
}

const showWordInfo = async (word) => {
  selectedWord.value = word
  showModal.value = true
  loading.value = true
  wordInfo.value = null

  try {
    const response = await fetch('http://localhost:3000/api/word-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word })
    })
    const data = await response.json()
    wordInfo.value = JSON.parse(data)
  } catch (error) {
    console.error('Error fetching word info:', error)
  } finally {
    loading.value = false
  }
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

// 防抖函数
const debounce = (fn, delay) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 使用防抖包装 generateWords
const debouncedGenerateWords = debounce(generateWords, 500)

onMounted(() => {
  generateWords()
  window.addEventListener('resize', debouncedGenerateWords)
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', debouncedGenerateWords)
})
</script>

<style scoped>
.word-container {
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  min-height: 100vh;
}

.word-tag {
  font-size: 14px;
  color: #666;
  padding: 4px 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.word-tag:hover {
  color: #000;
  border-radius: 50px;
  background-color: #e8e8e8;
}

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
  background-color: #fff;
  color: #666;
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
  background-color: #f5f5f5;
  color: #333;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 16px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.form-item {
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 12px;
  background-color: #f8f9fa;
  border: 1px solid #eee;
}

.form-value {
  font-size: 18px;
  color: #333;
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
  background-color: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.en {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 15px;
  line-height: 1.5;
}

.zh {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.loading {
  text-align: center;
  padding: 30px;
  color: #666;
  font-size: 16px;
}

/* 滚动条样式 */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>