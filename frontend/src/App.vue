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

    <WordModal
      :show="showModal"
      :word="selectedWord"
      :info="wordInfo"
      :loading="loading"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as randomWords from 'random-words'
import WordModal from './components/WordModal.vue'

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

const isPracticeMode = ref(false)

// 检查用户输入的答案
const checkAnswer = (example) => {
  if (!example.userInput) {
    example.inputStatus = ''
    return
  }
  // 忽略大小写和标点符号进行比较
  const normalizeText = (text) => {
    return text.toLowerCase().replace(/[.,!?]/g, '').trim()
  }
  
  example.inputStatus = normalizeText(example.userInput) === normalizeText(example.en) 
    ? 'correct' 
    : 'incorrect'
}

// 修改 showWordInfo 函数，添加用户输入字段
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
    const parsedData = JSON.parse(data)
    
    // 为每个例句添加用户输入和状态字段
    Object.values(parsedData.forms).forEach(form => {
      if (form && form.examples) {
        form.examples.forEach(example => {
          example.userInput = ''
          example.inputStatus = ''
        })
      }
    })
    
    wordInfo.value = parsedData
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
</style>