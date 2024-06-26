<template>
  <div v-if="percent" class="mask">
    <div class="content">
      <div class="text">{{ text }}</div>
      <el-progress style="width: 100%" :text-inside="true" :percentage="percent" />
      <div class="text btn" @click="cancel">{{ cancelText }}</div>
      <div class="text info">{{ msg }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { ElProgress } from 'element-plus'

type TProps = {
  percent: number
  text?: string
  cancelText?: string
  msg?: string
}

type TEmits = {
  (event: 'done'): void
  (event: 'cancel'): void
}

const props = withDefaults(defineProps<TProps>(), {
  percent: 0,
  text: '',
  cancelText: '',
  msg: ''
})

const emit = defineEmits<TEmits>()

watch(
  () => props.percent,
  (num) => {
    if (num >= 100) {
      setTimeout(() => {
        emit('done')
      }, 1000)
    }
  },
)

const cancel = () => {
  emit('cancel')
}

defineExpose({
  cancel
})

</script>

<style lang="less" scoped>
:deep(.el-progress-bar__innerText) {
  opacity: 0;
}
.mask {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 0 24%;
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
}
.content {
  background: #ffffff;
  border-radius: 8px;
  padding: 2rem 4rem;
}
.text {
  margin: 2rem 0;
  font-size: 20px;
  font-weight: bold;
  width: 100%;
  text-align: center;
  color: #333333;
}
.btn {
  font-weight: 400;
  font-size: 16px;
  cursor: pointer;
  color: #3771e5;
}
.info {
  font-weight: 400;
  font-size: 16px;
  color: #777777;
}
</style>
