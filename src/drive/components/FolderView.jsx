/* global __TARGET__ */
import React, { Component } from 'react'
import { translate } from 'cozy-ui/react/I18n'

import Main from './Main'
import Topbar from './Topbar'
import FileListHeader from './FileListHeader'

import { ROOT_DIR_ID } from '../constants/config'
import Breadcrumb from '../containers/Breadcrumb'
import { SelectionBar } from '../ducks/selection'
import { getFolderIdFromRoute } from '../reducers/view'
import AddFolder from './AddFolder'
import FileActionMenu from './FileActionMenu'
import MediaBackupProgression from '../mobile/containers/MediaBackupProgression'
import RatingModal from '../mobile/containers/RatingModal'
import FirstUploadModal from '../mobile/containers/FirstUploadModal'
import FolderContent from './FolderContent'

import styles from '../styles/folderview'

const toggle = (flag, state, props) => ({ [flag]: !state[flag] })

class FolderView extends Component {
  state = {
    showAddFolder: false
  }

  toggleAddFolder = () => {
    this.setState(toggle.bind(null, 'showAddFolder'))
  }

  createFolder = name => {
    return this.props.actions.list
      .createFolder(name)
      .then(() => this.toggleAddFolder())
  }

  abortAddFolder = accidental => {
    this.props.actions.list.abortAddFolder(accidental)
    this.toggleAddFolder()
  }

  render() {
    const {
      children,
      isTrashContext,
      actionMenuActive,
      selectionModeActive
    } = this.props
    const {
      files,
      selected,
      actionable,
      actions,
      Toolbar,
      canUpload,
      canCreateFolder
    } = this.props
    const { hideActionMenu, showSelectionBar } = this.props

    const { showAddFolder } = this.state

    const fetchFailed = this.props.fetchStatus === 'failed'
    const fetchPending = this.props.fetchStatus === 'pending'
    const isNavigating = this.props.isNavigating
    const nothingToDo = isTrashContext && files.length === 0
    const folderId = getFolderIdFromRoute(
      this.props.location,
      this.props.params
    )
    const isRootfolder = folderId === ROOT_DIR_ID

    const toolbarActions = {}
    if (canCreateFolder) toolbarActions.addFolder = this.toggleAddFolder
    return (
      <Main working={isNavigating}>
        <Topbar>
          <Breadcrumb />
          <Toolbar
            folderId={folderId}
            actions={toolbarActions}
            canUpload={canUpload}
            disabled={
              fetchFailed || fetchPending || selectionModeActive || nothingToDo
            }
            onSelectItemsClick={showSelectionBar}
          />
        </Topbar>
        <div role="contentinfo">
          {__TARGET__ === 'mobile' && (
            <div>
              {isRootfolder && <MediaBackupProgression />}
              <FirstUploadModal />
              <RatingModal />
            </div>
          )}
          <div style={{ display: selectionModeActive ? 'inherit' : 'none' }}>
            <SelectionBar selected={selected} actions={actions.selection} />
          </div>
          <div className={styles['fil-content-table']}>
            <FileListHeader />
            <div className={styles['fil-content-body']}>
              {showAddFolder && (
                <AddFolder
                  onSubmit={this.createFolder}
                  onAbort={this.abortAddFolder}
                />
              )}
              <FolderContent
                {...this.props}
                selectionModeActive={selectionModeActive}
                isAddingFolder={showAddFolder}
                isLoading={fetchPending || isNavigating}
                isInError={fetchFailed}
              />
            </div>
          </div>
          {this.renderViewer(children)}
          {actionMenuActive && (
            <FileActionMenu
              files={actionable}
              actions={actions.selection}
              onClose={hideActionMenu}
            />
          )}
        </div>
      </Main>
    )
  }

  renderViewer(children) {
    if (!children) return null
    return React.Children.map(children, child =>
      React.cloneElement(child, {
        files: this.props.files || [],
        isAvailableOffline: this.props.isAvailableOffline
      })
    )
  }
}

export default translate()(FolderView)
