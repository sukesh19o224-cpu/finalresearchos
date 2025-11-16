/**
 * Data Versioning System
 * Track changes and maintain version history
 */

export interface DataVersion {
  id: string
  datasetId: string
  version: number
  data: {
    xData: number[]
    yData: number[]
    metadata?: Record<string, any>
  }
  changes: string
  createdBy?: string
  createdAt: Date
  tags: string[]
}

export interface VersionDiff {
  pointsAdded: number
  pointsRemoved: number
  pointsModified: number
  metadataChanges: Record<string, { old: any; new: any }>
}

export class DataVersionManager {
  private static STORAGE_KEY_PREFIX = 'elctrdc_versions_'

  /**
   * Create new version
   */
  static createVersion(
    datasetId: string,
    xData: number[],
    yData: number[],
    changes: string,
    metadata?: Record<string, any>,
    createdBy?: string
  ): DataVersion {
    const versions = this.getVersions(datasetId)
    const latestVersion = versions.length > 0 ? Math.max(...versions.map((v) => v.version)) : 0

    const version: DataVersion = {
      id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      datasetId,
      version: latestVersion + 1,
      data: { xData, yData, metadata },
      changes,
      createdBy,
      createdAt: new Date(),
      tags: [],
    }

    versions.push(version)
    this.saveVersions(datasetId, versions)

    return version
  }

  /**
   * Get all versions for a dataset
   */
  static getVersions(datasetId: string): DataVersion[] {
    if (typeof window === 'undefined') return []

    const key = this.STORAGE_KEY_PREFIX + datasetId
    const stored = localStorage.getItem(key)

    if (!stored) return []

    try {
      const versions = JSON.parse(stored)
      return versions.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt),
      }))
    } catch (error) {
      console.error('Error parsing versions:', error)
      return []
    }
  }

  /**
   * Save versions
   */
  private static saveVersions(datasetId: string, versions: DataVersion[]): void {
    const key = this.STORAGE_KEY_PREFIX + datasetId
    localStorage.setItem(key, JSON.stringify(versions))
  }

  /**
   * Get specific version
   */
  static getVersion(datasetId: string, version: number): DataVersion | undefined {
    return this.getVersions(datasetId).find((v) => v.version === version)
  }

  /**
   * Get latest version
   */
  static getLatestVersion(datasetId: string): DataVersion | undefined {
    const versions = this.getVersions(datasetId)
    if (versions.length === 0) return undefined

    return versions.reduce((latest, current) =>
      current.version > latest.version ? current : latest
    )
  }

  /**
   * Restore version
   */
  static restoreVersion(datasetId: string, version: number): DataVersion | undefined {
    const targetVersion = this.getVersion(datasetId, version)
    if (!targetVersion) return undefined

    // Create new version with restored data
    return this.createVersion(
      datasetId,
      targetVersion.data.xData,
      targetVersion.data.yData,
      `Restored from version ${version}`,
      targetVersion.data.metadata
    )
  }

  /**
   * Compare two versions
   */
  static compareVersions(
    datasetId: string,
    version1: number,
    version2: number
  ): VersionDiff | null {
    const v1 = this.getVersion(datasetId, version1)
    const v2 = this.getVersion(datasetId, version2)

    if (!v1 || !v2) return null

    const diff: VersionDiff = {
      pointsAdded: 0,
      pointsRemoved: 0,
      pointsModified: 0,
      metadataChanges: {},
    }

    // Compare data lengths
    if (v2.data.xData.length > v1.data.xData.length) {
      diff.pointsAdded = v2.data.xData.length - v1.data.xData.length
    } else if (v2.data.xData.length < v1.data.xData.length) {
      diff.pointsRemoved = v1.data.xData.length - v2.data.xData.length
    }

    // Compare point values
    const minLength = Math.min(v1.data.xData.length, v2.data.xData.length)
    for (let i = 0; i < minLength; i++) {
      if (v1.data.xData[i] !== v2.data.xData[i] || v1.data.yData[i] !== v2.data.yData[i]) {
        diff.pointsModified++
      }
    }

    // Compare metadata
    if (v1.data.metadata && v2.data.metadata) {
      Object.keys({ ...v1.data.metadata, ...v2.data.metadata }).forEach((key) => {
        if (v1.data.metadata![key] !== v2.data.metadata![key]) {
          diff.metadataChanges[key] = {
            old: v1.data.metadata![key],
            new: v2.data.metadata![key],
          }
        }
      })
    }

    return diff
  }

  /**
   * Add tag to version
   */
  static addTag(datasetId: string, version: number, tag: string): void {
    const versions = this.getVersions(datasetId)
    const targetVersion = versions.find((v) => v.version === version)

    if (targetVersion && !targetVersion.tags.includes(tag)) {
      targetVersion.tags.push(tag)
      this.saveVersions(datasetId, versions)
    }
  }

  /**
   * Remove tag from version
   */
  static removeTag(datasetId: string, version: number, tag: string): void {
    const versions = this.getVersions(datasetId)
    const targetVersion = versions.find((v) => v.version === version)

    if (targetVersion) {
      targetVersion.tags = targetVersion.tags.filter((t) => t !== tag)
      this.saveVersions(datasetId, versions)
    }
  }

  /**
   * Get versions by tag
   */
  static getVersionsByTag(datasetId: string, tag: string): DataVersion[] {
    return this.getVersions(datasetId).filter((v) => v.tags.includes(tag))
  }

  /**
   * Delete version
   */
  static deleteVersion(datasetId: string, version: number): void {
    const versions = this.getVersions(datasetId)
    const filtered = versions.filter((v) => v.version !== version)
    this.saveVersions(datasetId, filtered)
  }

  /**
   * Delete all versions for dataset
   */
  static deleteAllVersions(datasetId: string): void {
    const key = this.STORAGE_KEY_PREFIX + datasetId
    localStorage.removeItem(key)
  }

  /**
   * Get version history
   */
  static getHistory(datasetId: string): Array<{
    version: number
    changes: string
    createdAt: Date
    createdBy?: string
  }> {
    return this.getVersions(datasetId)
      .sort((a, b) => b.version - a.version)
      .map((v) => ({
        version: v.version,
        changes: v.changes,
        createdAt: v.createdAt,
        createdBy: v.createdBy,
      }))
  }

  /**
   * Export version history
   */
  static exportHistory(datasetId: string): string {
    const versions = this.getVersions(datasetId)
    return JSON.stringify(versions, null, 2)
  }

  /**
   * Get storage size for dataset versions
   */
  static getStorageSize(datasetId: string): number {
    const key = this.STORAGE_KEY_PREFIX + datasetId
    const stored = localStorage.getItem(key)
    return stored ? stored.length : 0
  }
}
