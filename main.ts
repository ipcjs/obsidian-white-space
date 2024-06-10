import { Plugin } from 'obsidian';
import {
	RangeSetBuilder,
} from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

export default class HideEscapePlugin extends Plugin {

	async onload() {
		const escapeViewPlugin = ViewPlugin.fromClass(EscapeViewPlugin, {
			decorations: (value) => value.decorations,
		})
		this.registerEditorExtension(escapeViewPlugin)
	}

	onunload() {

	}

}

class EscapeViewPlugin implements PluginValue {
	decorations: DecorationSet
	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view)
	}

	update(update: ViewUpdate): void {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.buildDecorations(update.view)
		}
	}

	destroy(): void {

	}

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>()
		for (const { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from, to, enter(node) {
					console.log(node.type.name, view.state.sliceDoc(node.from, node.to), node)
					if (node.type.name === 'formatting-escape') {
						const line = view.state.sliceDoc(node.from - 1, node.to + 1)
						if (line === '\n\\\n' || line === '\\\n') {
							builder.add(node.from, node.to, Decoration.replace({ widget: new EscapeWidget() }))
						}
					}
				}
			})
		}
		return builder.finish()
	}
}

export class EscapeWidget extends WidgetType {
	toDOM(view: EditorView): HTMLElement {
		const span = document.createElement("span")
		span.innerText = "\\"
		span.className = 'escape-line'
		return span;
	}
}
