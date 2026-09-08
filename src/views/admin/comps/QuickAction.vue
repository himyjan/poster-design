<!--
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 palxiao https://xpai.design
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 -->
<template>
  <button type="button" class="quick-action" @click="$emit('go')">
    <span class="qa-icon"><el-icon><component :is="icon" /></el-icon></span>
    <span class="qa-text">
      <span class="qa-name">{{ name }}</span>
      <span class="qa-desc">{{ desc }}</span>
    </span>
    <el-icon class="qa-arrow"><ArrowRight /></el-icon>
  </button>
</template>

<script lang="ts" setup>
import type { Component } from 'vue'
import { ElIcon } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'

defineProps<{ icon: Component; name: string; desc: string }>()
defineEmits<{ go: [] }>()
</script>

<style lang="less" scoped>
.quick-action {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  background: @color-canvas;
  border: 1px solid @color-hairline;
  border-radius: @radius-sm;
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  .qa-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 36px;
    height: 36px;
    border-radius: @radius-sm;
    background: @color-surface-inset;
    color: @color-ink-secondary;
    font-size: 18px;
  }
  .qa-text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    .qa-name {
      font-size: 14px;
      font-weight: 600;
      color: @color-ink-strong;
    }
    .qa-desc {
      margin-top: 2px;
      font-size: 12px;
      color: @color-ink-muted;
    }
  }
  .qa-arrow {
    flex: none;
    font-size: 15px;
    color: @color-ink-hint;
    transition: color 0.15s, transform 0.15s;
  }
  &:hover {
    border-color: @color-hairline-strong;
    background: @color-canvas;
    .qa-arrow {
      color: @color-primary;
      transform: translateX(2px);
    }
  }
  &:focus-visible {
    outline: none;
    border-color: @color-primary;
    box-shadow: 0 0 0 2px @color-primary-ring;
  }
}
</style>
