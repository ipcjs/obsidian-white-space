import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { Emoji } from '@/emoji';

interface WhiteSpacePluginSettings {
	enable: boolean;
}

const DEFAULT_SETTINGS: WhiteSpacePluginSettings = {
	enable: true
}

export default class WhiteSpacePlugin extends Plugin {
	settings: WhiteSpacePluginSettings;

	async onload() {
		await this.loadSettings();

		if (false) {
			// This creates an icon in the left ribbon.
			const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice('This is a notice!');
			});
			// Perform additional things with the ribbon
			ribbonIconEl.addClass('my-plugin-ribbon-class');
		}

		if (false) {
			// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
			const statusBarItemEl = this.addStatusBarItem();
			statusBarItemEl.setText('Status Bar Text');
		}

		if (false) {
			// This adds a simple command that can be triggered anywhere
			this.addCommand({
				id: 'open-sample-modal-simple',
				name: 'Open sample modal (simple)',
				callback: () => {
					new SampleModal(this.app).open();
				}
			});
			// This adds an editor command that can perform some operation on the current editor instance
			this.addCommand({
				id: 'sample-editor-command',
				name: 'Sample editor command',
				editorCallback: (editor: Editor, view: MarkdownView) => {
					console.log(editor.getSelection());
					editor.replaceSelection('Sample Editor Command');
				}
			});
			// This adds a complex command that can check whether the current state of the app allows execution of the command
			this.addCommand({
				id: 'open-sample-modal-complex',
				name: 'Open sample modal (complex)',
				checkCallback: (checking: boolean) => {
					// Conditions to check
					const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
					if (markdownView) {
						// If checking is true, we're simply "checking" if the command can be run.
						// If checking is false, then we want to actually perform the operation.
						if (!checking) {
							new SampleModal(this.app).open();
						}

						// This command will only show up in Command Palette when the check function returns true
						return true;
					}
				}
			});
		}

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		if (false) {
			// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
			// Using this function will automatically remove the event listener when this plugin is disabled.
			this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
				console.log('click', evt);
			});

			// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
			this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
		}

		// 替换code中的emoji
		this.registerMarkdownPostProcessor((element, context) => {
			console.log(element.innerHTML)
			const codeblocks = element.querySelectorAll("code");
			for (let index = 0; index < codeblocks.length; index++) {
				const codeblock = codeblocks.item(index);
				const text = codeblock.innerText.trim();
				const isEmoji = text[0] === ":" && text[text.length - 1] === ":";
				if (isEmoji) {
					context.addChild(new Emoji(codeblock, text));
				}
			}
		})
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SettingTab extends PluginSettingTab {
	plugin: WhiteSpacePlugin;

	constructor(app: App, plugin: WhiteSpacePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		new Setting(containerEl)
			.setName('Enable')
			.setDesc('Default enable/disable show white space.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enable)
				.onChange(async value => {
					this.plugin.settings.enable = value
					await this.plugin.saveSettings()
				})
			)
	}
}
