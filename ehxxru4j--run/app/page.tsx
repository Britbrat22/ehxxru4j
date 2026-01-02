'use client';
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface VocalEnhancerInput {
  audioFile: File;
  beatStyle: string;
  noiseReductionLevel: number;
  tempo: number;
}

interface VocalEnhancerOutput {
  processedAudioFile: File;
  generatedBeatFile: File;
  errors?: string[];
}

const VocalEnhancer: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [beatStyle, setBeatStyle] = useState<string>("");
  const [noiseReductionLevel, setNoiseReductionLevel] = useState<number>(0);
  const [tempo, setTempo] = useState<number>(120);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<VocalEnhancerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('audioFile', audioFile);
    formData.append('beatStyle', beatStyle);
    formData.append('noiseReductionLevel', noiseReductionLevel.toString());
    formData.append('tempo', tempo.toString());

    try {
      const response = await fetch('/api', {
        method: 'POST',
        body: formData,
      });
      const data: VocalEnhancerOutput = await response.json();
      setResponse(data);
    } catch (err) {
      setError("An error occurred while processing the audio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Vocal Enhancer and Beat Generator</CardTitle>
        <CardDescription>Upload your vocal audio and create a track!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)} />
          <Select onValueChange={setBeatStyle}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Beat Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hip Hop">Hip Hop</SelectItem>
              <SelectItem value="Pop">Pop</SelectItem>
              <SelectItem value="Jazz">Jazz</SelectItem>
            </SelectContent>
          </Select>
          <Input type="range" min="0" max="100" value={noiseReductionLevel} onChange={(e) => setNoiseReductionLevel(Number(e.target.value))} />
          <Input type="number" value={tempo} onChange={(e) => setTempo(Number(e.target.value))} />
          <Button type="submit" disabled={loading}>{loading ? "Processing..." : "Enhance Vocal"}</Button>
        </form>
        {error && <p className="text-red-500">{error}</p>}
        {response && (
          <div>
            <h2>Processed Files</h2>
            <a href={URL.createObjectURL(response.processedAudioFile)} download>Download Processed Audio</a>
            <br />
            <a href={URL.createObjectURL(response.generatedBeatFile)} download>Download Generated Beat</a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VocalEnhancer;