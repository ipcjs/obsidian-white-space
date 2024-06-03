import { MarkdownPostProcessor, MarkdownRenderChild } from "obsidian";
import { Decoration, DecorationSet, EditorView, WidgetType, PluginValue, ViewUpdate, PluginSpec, ViewPlugin } from '@codemirror/view';
import { EditorState, RangeSetBuilder, StateField } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

class Emoji extends MarkdownRenderChild {
	static ALL_EMOJIS: Record<string, string> = {
		":+1:": "👍",
		":sunglasses:": "😎",
		":smile:": "😄",
	};
	text: string;
	constructor(containerEl: HTMLElement, text: string) {
		super(containerEl);
		this.text = text;
	}

	onload() {
		const emojiEl = this.containerEl.createSpan({ text: Emoji.ALL_EMOJIS[this.text] ?? this.text, });
		this.containerEl.replaceWith(emojiEl);
	}
}

export const emojiMarkdownProcessor: MarkdownPostProcessor = (element, context) => {
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
}

class EmojiWidget extends WidgetType {
	toDOM(view: EditorView): HTMLElement {
		const div = document.createElement('span')
		div.innerHTML = '👉🏻️'
		return div
	}
}

class EscapeWidget extends WidgetType {
	toDOM(view: EditorView): HTMLElement {
		const span = document.createElement('span')
		span.textContent = '\\'
		span.setCssStyles({
			color: 'var(--text-faint)',
		})
		return span
	}
}

class EmptyWidget extends WidgetType {
	toDOM(view: EditorView): HTMLElement {
		return document.createElement('span')
	}
}

function updateImpl(state: EditorState) {
	const builder = new RangeSetBuilder<Decoration>()
	syntaxTree(state).iterate({
		enter(node) {
			// console.log(node.type.name)
			if (node.type.name === 'formatting-escape') {
				builder.add(
					node.from,
					node.to,
					Decoration.replace({
						widget: new EscapeWidget()
					})
				)
			}
			if (false && node.type.name.startsWith('list')) {
				// console.log(node.type.name, node)
				const listCharFrom = node.from - 2;
				builder.add(
					listCharFrom,
					listCharFrom + 1,
					Decoration.replace({
						widget: new EmojiWidget()
					})
				)
			}
		}
	})
	return builder.finish()
}

export const emojiListField = StateField.define<DecorationSet>({
	create(state) {
		return Decoration.none
	},
	update(value, transaction) {
		return updateImpl(transaction.state)
	},
	provide(field) {
		return EditorView.decorations.from(field)
	},
})



class EmojiListPlugin implements PluginValue {
	decorations: DecorationSet
	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view)
	}

	update(update: ViewUpdate): void {
		if (update.docChanged || update.viewportChanged) {
			console.log(update)
			this.decorations = this.buildDecorations(update.view)
		}
	}
	destroy(): void {

	}
	buildDecorations(view: EditorView) {
		return updateImpl(view.state)
	}
}

const pluginSpec: PluginSpec<EmojiListPlugin> = {
	decorations: (v) => v.decorations
}

export const emojiListPlugin = ViewPlugin.fromClass(
	EmojiListPlugin,
	pluginSpec,
)
