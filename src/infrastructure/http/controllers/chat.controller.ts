import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';

export class ChatController {
  async handle(req: Request, res: Response): Promise<void> {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ success: false, message: 'Prompt is required' });
      return;
    }

    const scriptPath = path.join(__dirname, '..', '..', 'ai', 'assistant.py');
    
    // Determine the python command, usually 'python' on Windows
    const pythonProcess = spawn('python', [scriptPath, prompt]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        res.status(500).json({ success: false, message: 'Failed to process AI request', error: errorOutput });
        return;
      }

      try {
        const result = JSON.parse(output);
        if (!result.success) {
           res.status(400).json({ success: false, message: result.error });
           return;
        }
        res.status(200).json({ success: true, data: result.data });
      } catch (err) {
        console.error('Failed to parse python output:', err);
        console.error('Raw output:', output);
        res.status(500).json({ success: false, message: 'Invalid response from AI assistant' });
      }
    });
  }
}
