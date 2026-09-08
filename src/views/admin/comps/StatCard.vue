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
  <div class="stat-card" @click="$emit('go')">
    <div class="stat-icon"><el-icon><component :is="icon" /></el-icon></div>
    <div class="stat-body">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ value }}</div>
      <div v-if="hint" class="stat-hint">{{ hint }}</div>
    </div>
    <el-icon class="stat-arrow"><ArrowRight /></el-icon>
  </div>
</template>

<script lang="ts" setup>
import type { Component } from 'vue'
import { ElIcon } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'

withDefaults(
  defineProps<{ label: string; value: number; icon: Component; hint?: string }>(),
  { hint: '' },
)
defineEmits<{ go: [] }>()
</script>

<style lang="less" scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: @color-canvas;
  border: 1px solid @color-hairline;
  border-radius: @radius-md;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:hover {
    border-color: @color-hairline-strong;
    .stat-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 44px;
    height: 44px;
    border-radius: @radius-sm;
    background: @color-primary-soft;
    color: @color-primary;
    font-size: 22px;
  }
  .stat-body {
    min-width: 0;
    flex: 1;
    .stat-label {
      font-size: 13px;
      color: @color-ink-muted;
    }
    .stat-value {
      margin-top: 3px;
      font-size: 26px;
      font-weight: 600;
      line-height: 1.1;
      color: @color-ink-strong;
      font-variant-numeric: tabular-nums;
    }
    .stat-hint {
      margin-top: 3px;
      font-size: 12px;
      color: @color-ink-hint;
    }
  }
  .stat-arrow {
    flex: none;
    font-size: 16px;
    color: @color-primary;
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity 0.15s, transform 0.15s;
  }
}
</style>
