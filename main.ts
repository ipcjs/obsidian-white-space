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
			let pos = from
			while (pos <= to) {
				const line = view.state.doc.lineAt(pos);
				if (line.text === '\\') {
					builder.add(line.from, line.to, Decoration.replace({ widget: new EscapeWidget() }));
				}
				pos = line.to + 1;
			}
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
